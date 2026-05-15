import { describe, expect, it } from "vitest";
import { allCorridors, allStations, stationByCode } from "./stations";

describe("stations dataset", () => {
  it("contains all 99 Metrolink stations", () => {
    expect(allStations()).toHaveLength(99);
  });

  it("has 8 distinct corridors", () => {
    expect(allCorridors()).toHaveLength(8);
  });

  it("returns a station by TLAREF code", () => {
    const sps = stationByCode("SPS");
    expect(sps).toBeDefined();
    expect(sps?.name).toBe("St Peter's Square");
  });

  it("returns undefined for an unknown code", () => {
    expect(stationByCode("XXX")).toBeUndefined();
  });

  it("every station has a corridor that matches one of the 8 corridors", () => {
    const corridorNames = new Set(allCorridors().map((c) => c.name));
    for (const s of allStations()) {
      expect(corridorNames.has(s.corridor)).toBe(true);
    }
  });

  it("every station has a zone in 1..4", () => {
    for (const s of allStations()) {
      expect(s.zone).toBeGreaterThanOrEqual(1);
      expect(s.zone).toBeLessThanOrEqual(4);
    }
  });

  it("every station has at least one service line", () => {
    for (const s of allStations()) {
      expect(s.lines.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("interchange stations have multiple service lines", () => {
    expect(stationByCode("SPS")?.lines.length).toBe(8);
    expect(stationByCode("PIC")?.lines.length).toBeGreaterThan(1);
    expect(stationByCode("VIC")?.lines.length).toBeGreaterThan(1);
  });

  it("terminus stations have exactly one service line", () => {
    expect(stationByCode("AIR")?.lines).toEqual(["Airport"]);
    expect(stationByCode("ALT")?.lines).toEqual(["Altrincham"]);
    expect(stationByCode("BRY")?.lines).toEqual(["Bury"]);
  });
});
