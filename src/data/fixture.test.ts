import { describe, expect, it } from "vitest";
import fixture from "./fixture.json";
import { departuresFor, groupByDirection, messageBoardFor, type TfgmResponse } from "../lib/api";

const FIXTURE = fixture as TfgmResponse;

describe("bundled fixture", () => {
  it("contains the expected number of platforms", () => {
    expect(FIXTURE.value.length).toBeGreaterThan(200);
  });

  it("has the right shape on every row", () => {
    for (const row of FIXTURE.value.slice(0, 10)) {
      expect(typeof row.TLAREF).toBe("string");
      expect(typeof row.StationLocation).toBe("string");
      expect(typeof row.Line).toBe("string");
      expect(typeof row.PIDREF).toBe("string");
      expect(typeof row.LastUpdated).toBe("string");
    }
  });

  it("yields non-empty departures for a major interchange (SPS)", () => {
    const departures = departuresFor(FIXTURE.value, "SPS");
    expect(departures.length).toBeGreaterThan(0);
  });

  it("groupByDirection finds multiple directions at SPS", () => {
    const groups = groupByDirection(departuresFor(FIXTURE.value, "SPS"));
    expect(groups.length).toBeGreaterThan(1);
    for (const g of groups) {
      expect(g.label.startsWith("Towards ")).toBe(true);
    }
  });

  it("surfaces the engineering-works message for the snapshot day", () => {
    const msg = messageBoardFor(FIXTURE.value, "SPS");
    expect(msg).not.toBeNull();
    expect(msg!.length).toBeGreaterThan(0);
  });
});
