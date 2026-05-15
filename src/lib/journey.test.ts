import { describe, expect, it } from "vitest";
import { LINE_ORDERS, findRoute, reachableFrom, SIM } from "./journey";
import { stationByCode } from "./stations";

describe("LINE_ORDERS resolution", () => {
  it("includes the 8 service lines plus the MediaCityUK branch", () => {
    expect(Object.keys(LINE_ORDERS).sort()).toEqual([
      "Airport",
      "Altrincham",
      "Ashton",
      "Bury",
      "East Didsbury",
      "Eccles",
      "MediaCityUK",
      "Rochdale",
      "Trafford Park",
    ]);
  });

  it("resolves every line ordering to non-empty station codes", () => {
    for (const [line, order] of Object.entries(LINE_ORDERS)) {
      expect(order.length).toBeGreaterThan(0);
      for (const code of order) {
        expect(stationByCode(code), `${line} contains unknown code ${code}`).toBeDefined();
      }
    }
  });

  it("the Bury line connects Bury and Piccadilly via Victoria", () => {
    const bury = LINE_ORDERS["Bury"]!;
    expect(bury[0]).toBe("BRY");
    expect(bury[bury.length - 1]).toBe("PIC");
    expect(bury.includes("VIC")).toBe(true);
  });

  it("the Altrincham line starts at Altrincham and ends at Bury", () => {
    const alt = LINE_ORDERS["Altrincham"]!;
    expect(alt[0]).toBe("ALT");
    expect(alt[alt.length - 1]).toBe("BRY");
  });
});

describe("findRoute", () => {
  it("returns null when origin == destination", () => {
    expect(findRoute("SPS", "SPS")).toBeNull();
  });

  it("returns a multi-segment route for trips that need a transfer", () => {
    // Manchester Airport ↔ Bury can't be done on a single line — but with
    // multi-line routing it's reachable via a transfer in the city centre.
    const route = findRoute("AIR", "BRY");
    expect(route).not.toBeNull();
    expect(route!.stations[0]).toBe("AIR");
    expect(route!.stations.at(-1)).toBe("BRY");
    expect(route!.transfers).toBeGreaterThanOrEqual(1);
    expect(route!.segments.length).toBeGreaterThanOrEqual(2);
  });

  it("Piccadilly → MediaCityUK routes via Harbour City", () => {
    const route = findRoute("PIC", "MEC");
    expect(route).not.toBeNull();
    expect(route!.stations[0]).toBe("PIC");
    expect(route!.stations.at(-1)).toBe("MEC");
    // One transfer at Harbour City (Eccles → MediaCityUK branch).
    expect(route!.transfers).toBe(1);
    expect(route!.stations).toContain("HBC");
  });

  it("finds a route along a single line in travel order", () => {
    const route = findRoute("ALT", "SPS");
    expect(route).not.toBeNull();
    expect(route!.stations[0]).toBe("ALT");
    expect(route!.stations[route!.stations.length - 1]).toBe("SPS");
    expect(route!.lineId).toBe("Altrincham");
  });

  it("reverses the slice when origin comes after destination in the array", () => {
    const route = findRoute("SPS", "ALT");
    expect(route).not.toBeNull();
    expect(route!.stations[0]).toBe("SPS");
    expect(route!.stations[route!.stations.length - 1]).toBe("ALT");
  });

  it("picks the shortest single-line route when multiple lines work", () => {
    // From PIC, both Bury and Eccles lines reach SPS (PIC is on both).
    // The shortest hop count should win.
    const route = findRoute("PIC", "SPS");
    expect(route).not.toBeNull();
    expect(route!.stations[0]).toBe("PIC");
    expect(route!.stations[route!.stations.length - 1]).toBe("SPS");
    // PIC is 1–3 stops from SPS depending on routing; should be small.
    expect(route!.stations.length).toBeLessThanOrEqual(4);
  });

  it("returns inclusive stations on both ends", () => {
    const route = findRoute("ALT", "TFB")!; // ALT → Trafford Bar
    expect(route.stations[0]).toBe("ALT");
    expect(route.stations.at(-1)).toBe("TFB");
  });
});

describe("reachableFrom", () => {
  it("returns at least 14 destinations from St Peter's Square (8 lines)", () => {
    const reached = reachableFrom("SPS");
    expect(reached.length).toBeGreaterThan(14);
  });

  it("does not include the origin itself", () => {
    expect(reachableFrom("SPS")).not.toContain("SPS");
  });

  it("from Altrincham terminus, reaches Bury via the Altrincham line", () => {
    const reached = reachableFrom("ALT");
    expect(reached).toContain("BRY");
    expect(reached).toContain("SPS");
  });

  it("returns an empty list for a station not in any LINE_ORDER", () => {
    // No station has code "ZZZ" so reachableFrom returns nothing.
    expect(reachableFrom("ZZZ")).toEqual([]);
  });
});

describe("SIM constants", () => {
  it("has sane defaults", () => {
    expect(SIM.secondsPerStop).toBeGreaterThan(0);
    expect(SIM.tickMs).toBeGreaterThan(0);
  });
});
