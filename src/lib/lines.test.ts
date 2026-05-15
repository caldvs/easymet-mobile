import { describe, expect, it } from "vitest";
import { CORRIDORS, corridorFor, corridorForDestination } from "./lines";

describe("corridorFor", () => {
  it("returns the design display name for a known corridor", () => {
    expect(corridorFor("East Manchester").displayName).toBe("Ashton");
    expect(corridorFor("South Manchester").displayName).toBe("East Didsbury");
    expect(corridorFor("Oldham & Rochdale").displayName).toBe("Rochdale");
  });

  it("returns identical display name when corridor and service share a name", () => {
    expect(corridorFor("Airport").displayName).toBe("Airport");
    expect(corridorFor("Bury").displayName).toBe("Bury");
  });

  it("returns a fallback for unknown corridors", () => {
    const result = corridorFor("Not a real line");
    expect(result.displayName).toBe("Unknown");
    expect(result.colour).toBe("#999999");
  });

  it("maps every CORRIDORS entry to a hex colour", () => {
    for (const c of Object.values(CORRIDORS)) {
      expect(c.colour).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

describe("corridorForDestination", () => {
  it("infers the correct corridor from common destinations", () => {
    expect(corridorForDestination("Altrincham", "Eccles")).toBe("Altrincham");
    expect(corridorForDestination("Manchester Airport", "Eccles")).toBe("Airport");
    expect(corridorForDestination("Bury", "Eccles")).toBe("Bury");
    expect(corridorForDestination("Rochdale Town Centre", "Eccles")).toBe("Oldham & Rochdale");
    expect(corridorForDestination("The Trafford Centre", "Eccles")).toBe("Trafford Park");
  });

  it("handles both hyphenation variants of Ashton-under-Lyne", () => {
    expect(corridorForDestination("Ashton-under-Lyne", "X")).toBe("East Manchester");
    expect(corridorForDestination("Ashton-Under-Lyne", "X")).toBe("East Manchester");
  });

  it("falls back to the platform corridor for ambiguous destinations", () => {
    expect(corridorForDestination("Piccadilly", "Bury")).toBe("Bury");
    expect(corridorForDestination("Victoria", "Altrincham")).toBe("Altrincham");
    expect(corridorForDestination("MediaCityUK", "Eccles")).toBe("Eccles");
  });

  it("falls back when destination is empty", () => {
    expect(corridorForDestination("", "Eccles")).toBe("Eccles");
  });
});
