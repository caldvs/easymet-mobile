# easymet-push-server

A small local HTTP server that drives Live Activity push updates so the
lock-screen widget keeps ticking when the app is in the background.
Targets the iOS Simulator only.

## Why

iOS suspends the React Native JavaScript runtime as soon as the app is
backgrounded. `Activity.update(...)` calls from the app stop firing,
the widget freezes. The only Apple-sanctioned way to keep updates
flowing in the background is APNs push notifications. This server is
the local stand-in: it captures the activity's push token from the
running app and pushes `simctl`-simulated APNs payloads at a regular
cadence.

## Run

```bash
# from the project root
node scripts/push-server/server.js
# or
npm start --prefix scripts/push-server
```

Default port: `3030`. Override with `PORT=...`.

The server discovers the booted simulator via `xcrun simctl list devices
--booted`. Boot a simulator before starting a journey.

## Endpoints

| Method + Path | Body | Effect |
|---|---|---|
| `POST /start` | `{ token, intervalMs, journeyDurationMs }` | Schedule push updates for the activity identified by `token`, every `intervalMs`, for at most `journeyDurationMs + 60s`. Cancels any existing schedule first. |
| `POST /cancel` | *(none)* | Stop the active scheduler. |

`token` is the hex-encoded APNs push token issued by ActivityKit. The
iOS module captures it via `activity.pushTokenUpdates` and the JS layer
in `src/lib/JourneyContext.tsx` POSTs it here on every journey start.

## Push payload shape

Each scheduled push delivers:

```json
{
  "aps": {
    "timestamp": 1234567890,
    "event": "update",
    "content-state": {
      "isDelayed": false,
      "tick": 5
    }
  }
}
```

The widget reads only `tick` from ContentState (to force iOS to diff
and re-render). All other state — current station, count-down, phase —
is derived inside the widget from the static attributes
(`journeyStartedAt`, `secondsPerStop`, `stationNames`, etc.) plus
`Date()`. So the push is essentially a "kick" — its contents barely
matter, what matters is the act of pushing.

## Future: real-device APNs

When real-device push is needed (after Apple Developer enrolment), only
the `push()` function in `server.js` changes. The wiring of token
capture, scheduling, and payload shape stays identical.

Drop-in replacement looks like:

1. Generate a `.p8` auth key in the Apple Developer portal with
   "Apple Push Notifications service (APNs)" enabled.
2. Note the key ID and your team ID.
3. Replace `push()` with an HTTP/2 POST to
   `https://api.push.apple.com/3/device/{token}` carrying a JWT signed
   with the `.p8`. The body is the same payload shape as today.
4. Set `apns-push-type: liveactivity` and `apns-topic:
   com.dvscllm.easymetmobile.push-type.liveactivity` headers.

Everything in the app and the rest of this server stays the same.
