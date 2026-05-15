// Shared Playwright helpers: response mocks for the easymet-edge worker
// endpoints, deterministic localStorage seeding for app state, and
// geolocation setup. Keeps individual specs declarative.

import type { Browser, BrowserContext, Page, Route } from "@playwright/test";

const EDGE_BASE = "https://easymet-edge.dvscllm.workers.dev";

// ---- Disruptions ----------------------------------------------------------

export type MockSeverity = "severe" | "notice" | "info";
export type MockType = "incident" | "planned-works";
export type MockScope = "network" | "line" | "station";

export interface MockDisruption {
  id?: string;
  title: string;
  body: string;
  severity: MockSeverity;
  scope: MockScope;
  type: MockType;
  startsAt?: string | null;
  endsAt?: string | null;
  linesRaw?: string[];
  stopsRaw?: string[];
  affectedCorridors?: string[];
  affectedStationCodes?: string[];
}

export function buildDisruption(d: MockDisruption) {
  return {
    id: d.id ?? Math.random().toString(36).slice(2, 12),
    source: "travel-alerts" as const,
    sourceUrl: `${EDGE_BASE}/disruptions`,
    fetchedAt: new Date().toISOString(),
    sourceUpdatedAt: new Date().toISOString(),
    title: d.title,
    body: d.body,
    startsAt: d.startsAt === undefined ? new Date(Date.now() - 60_000).toISOString() : d.startsAt,
    endsAt: d.endsAt === undefined ? null : d.endsAt,
    type: d.type,
    scope: d.scope,
    severity: d.severity,
    linesRaw: d.linesRaw ?? [],
    stopsRaw: d.stopsRaw ?? [],
    affectedCorridors: d.affectedCorridors ?? [],
    affectedStationCodes: d.affectedStationCodes ?? [],
  };
}

export async function mockDisruptions(page: Page, disruptions: MockDisruption[]) {
  await page.route(`${EDGE_BASE}/disruptions`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        fetchedAt: new Date().toISOString(),
        disruptions: disruptions.map(buildDisruption),
      }),
    });
  });
}

export async function mockDisruptionsFailure(page: Page, status = 503) {
  await page.route(`${EDGE_BASE}/disruptions`, async (route) => {
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify({ error: "upstream_error" }),
    });
  });
}

export async function mockDisruptionsHang(page: Page) {
  // Never fulfil — caller times out. Useful to verify loading-state UX.
  await page.route(`${EDGE_BASE}/disruptions`, async () => {
    /* held open */
  });
}

// ---- Metrolinks (departures) ----------------------------------------------

export async function mockMetrolinksFailure(page: Page, status = 502) {
  await page.route(`${EDGE_BASE}/metrolinks`, async (route) => {
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify({ error: "upstream_error" }),
    });
  });
}

export async function mockMetrolinksEmpty(page: Page) {
  await page.route(`${EDGE_BASE}/metrolinks`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ value: [] }),
    });
  });
}

// ---- localStorage seeding -------------------------------------------------

export async function seedFavourites(page: Page, codes: string[]) {
  await page.addInitScript((codes) => {
    window.localStorage.setItem("easymet:favourites:v1", JSON.stringify(codes));
  }, codes);
}

export async function clearAppState(page: Page) {
  await page.addInitScript(() => {
    try {
      window.localStorage.clear();
      // Pin the dev scenario to "live" so route mocks work. Without
      // this, `DemoProvider` would short-circuit to "demo" by default
      // on localhost (no real fetches in dev) or between 01:00–06:00 UK
      // (overnight UX), both of which bypass the test's mocked
      // /metrolinks response.
      window.localStorage.setItem("easymet:scenario:v1", "live");
      window.localStorage.setItem("easymet:demo:v1", "0");
    } catch {
      /* SecurityError when storage disabled — ignore */
    }
  });
}

// ---- Geolocation ----------------------------------------------------------

export async function setGeolocation(
  context: BrowserContext,
  coord: { latitude: number; longitude: number },
) {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation(coord);
}

// Manchester city centre — useful default for "user is at a Metrolink stop".
export const MANCHESTER_PICCADILLY = { latitude: 53.4775, longitude: -2.2310 };
export const ALTRINCHAM = { latitude: 53.3873, longitude: -2.3475 };
