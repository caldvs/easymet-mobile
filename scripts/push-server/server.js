#!/usr/bin/env node
//
// easymet-push-server
//
// A tiny HTTP server that delivers Live Activity push updates to the
// iOS Simulator via `xcrun simctl push`. Designed to be replaced with
// an APNs HTTP/2 driver when real-device push is needed (only the
// `push()` function changes).
//
// Endpoints:
//   POST /start  { token, intervalMs, journeyDurationMs }
//       Begin scheduling tick pushes for the activity identified by
//       `token`. Cancels any existing scheduler so a fresh journey
//       supersedes a stale one.
//   POST /cancel
//       Stop the active scheduler (if any). Called when the user ends
//       the journey.
//
// Run: `node scripts/push-server/server.js`
// Or:  `npm start --prefix scripts/push-server`

const http = require("http");
const { execFileSync, spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const PORT = process.env.PORT ? Number(process.env.PORT) : 3030;
const BUNDLE_ID = "com.dvscllm.easymetmobile";

// Holds the current scheduler, if any. Only one journey is active at a
// time in this app, so a single slot is sufficient. If we ever support
// multiple concurrent activities, key by token.
let scheduler = null;

const server = http.createServer((req, res) => {
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method Not Allowed");
    return;
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > 1 << 20) {
      // 1 MB safety cap
      req.connection.destroy();
    }
  });
  req.on("end", () => {
    try {
      if (req.url === "/start") {
        const payload = body ? JSON.parse(body) : {};
        handleStart(payload, res);
      } else if (req.url === "/cancel") {
        handleCancel(res);
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
      }
    } catch (err) {
      console.error("Request failed:", err);
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end(`Bad Request: ${err.message}`);
    }
  });
});

function handleStart({ token, intervalMs, journeyDurationMs }, res) {
  if (typeof token !== "string" || token.length < 8) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("missing token");
    return;
  }
  const interval = Number(intervalMs) > 0 ? Number(intervalMs) : 30_000;
  const duration = Number(journeyDurationMs) > 0 ? Number(journeyDurationMs) : 60 * 60 * 1000;

  cancelScheduler("superseded by new /start");

  const deviceId = bootedSimulator();
  if (!deviceId) {
    console.warn("No booted simulator found — pushes will be dropped.");
  }

  const tokenShort = token.slice(0, 8);
  const startedAt = Date.now();
  let tick = 0;

  console.log(
    `[start] token=${tokenShort}… device=${deviceId ?? "none"} ` +
      `interval=${interval}ms duration=${duration}ms`,
  );

  const intervalHandle = setInterval(() => {
    tick += 1;
    push(deviceId, token, tick);

    if (Date.now() - startedAt > duration + 60_000) {
      // Safety stop — never run beyond the expected journey duration + 1 min.
      console.log(`[stop] token=${tokenShort}… duration exceeded`);
      cancelScheduler("duration exceeded");
    }
  }, interval);

  scheduler = { intervalHandle, token, deviceId, startedAt };

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: true, deviceId }));
}

function handleCancel(res) {
  cancelScheduler("/cancel");
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: true }));
}

function cancelScheduler(reason) {
  if (!scheduler) return;
  clearInterval(scheduler.intervalHandle);
  console.log(`[cancel] token=${scheduler.token.slice(0, 8)}… reason=${reason}`);
  scheduler = null;
}

// --- push driver (simctl) -------------------------------------------------
//
// To swap in an APNs HTTP/2 driver later: replace the body of `push()`
// with a JWT-signed HTTP/2 request to api.push.apple.com. The payload
// shape is identical.

function push(deviceId, token, tick) {
  if (!deviceId) return;

  const payload = {
    aps: {
      timestamp: Math.floor(Date.now() / 1000),
      event: "update",
      "content-state": {
        isDelayed: false,
        tick,
      },
    },
  };

  const tmp = path.join(os.tmpdir(), `easymet-push-${token.slice(0, 8)}.json`);
  fs.writeFileSync(tmp, JSON.stringify(payload));

  // simctl push for Live Activities can target by bundle id (delivers to
  // the most recent activity) OR by push token (targets a specific
  // activity instance). Using the token is closer to the production
  // APNs flow and disambiguates if multiple activities are ever live.
  const result = spawnSync(
    "xcrun",
    ["simctl", "push", deviceId, token, tmp],
    { encoding: "utf8" },
  );
  if (result.status !== 0) {
    // Fall back to bundle id targeting if token-based push isn't
    // supported on this simctl version.
    const fallback = spawnSync(
      "xcrun",
      ["simctl", "push", deviceId, BUNDLE_ID, tmp],
      { encoding: "utf8" },
    );
    if (fallback.status !== 0) {
      console.warn(
        `[push] tick=${tick} failed: ${result.stderr || fallback.stderr || "unknown"}`,
      );
      return;
    }
  }
  process.stdout.write(`[push] tick=${tick}\r`);
}

function bootedSimulator() {
  try {
    // `--booted` was added in newer simctl; older Xcode CLI tools don't
    // recognise it. List all devices and filter for state === "Booted".
    const out = execFileSync(
      "xcrun",
      ["simctl", "list", "devices", "-j"],
      { encoding: "utf8" },
    );
    const data = JSON.parse(out);
    for (const runtime of Object.keys(data.devices)) {
      for (const dev of data.devices[runtime]) {
        if (dev.state === "Booted") return dev.udid;
      }
    }
  } catch (err) {
    console.warn("Failed to list simulators:", err.message);
  }
  return null;
}

server.listen(PORT, "127.0.0.1", () => {
  console.log(`easymet-push-server listening on http://localhost:${PORT}`);
  const booted = bootedSimulator();
  if (booted) {
    console.log(`booted simulator: ${booted}`);
  } else {
    console.log("no booted simulator detected — boot one before starting a journey");
  }
});
