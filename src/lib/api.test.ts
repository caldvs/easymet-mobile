import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  departuresFor,
  fetchMetrolinks,
  getAnnouncements,
  groupByDirection,
  messageBoardFor,
  type TfgmPlatform,
} from "./api";

// Minimal helper to build a TfGM platform row with sensible defaults.
function platform(overrides: Partial<TfgmPlatform> = {}): TfgmPlatform {
  return {
    Id: 1,
    Line: "Eccles",
    TLAREF: "SPS",
    PIDREF: "SPS-TPID01",
    StationLocation: "St Peter's Square",
    AtcoCode: "9400ZZMASTP4",
    Direction: "Outgoing",
    Dest0: "", Carriages0: "", Status0: "", Wait0: "",
    Dest1: "", Carriages1: "", Status1: "", Wait1: "",
    Dest2: "", Carriages2: "", Status2: "", Wait2: "",
    Dest3: "", Carriages3: "", Status3: "", Wait3: "",
    MessageBoard: "",
    LastUpdated: "2026-05-13T00:00:00Z",
    ...overrides,
  };
}

describe("departuresFor", () => {
  it("returns no departures for a station with no matching platforms", () => {
    expect(departuresFor([platform({ TLAREF: "PIC" })], "ALT")).toEqual([]);
  });

  it("expands each non-empty Dest slot into a separate departure", () => {
    const result = departuresFor(
      [
        platform({
          Dest0: "Altrincham", Wait0: "3", Status0: "Due", Carriages0: "Double",
          Dest1: "Altrincham", Wait1: "11", Status1: "Due", Carriages1: "Single",
        }),
      ],
      "SPS",
    );
    expect(result).toHaveLength(2);
    expect(result[0]?.waitMinutes).toBe(3);
    expect(result[1]?.waitMinutes).toBe(11);
    expect(result[0]?.carriages).toBe(2);
    expect(result[1]?.carriages).toBe(1);
  });

  it("skips empty Dest slots", () => {
    const result = departuresFor(
      [platform({ Dest0: "Altrincham", Wait0: "3", Status0: "Due", Carriages0: "Single" })],
      "SPS",
    );
    expect(result).toHaveLength(1);
  });

  it("sorts departures by wait time across multiple platforms", () => {
    const result = departuresFor(
      [
        platform({ PIDREF: "SPS-A", Dest0: "Altrincham", Wait0: "11" }),
        platform({ PIDREF: "SPS-B", Dest0: "Bury", Wait0: "3" }),
      ],
      "SPS",
    );
    expect(result.map((d) => d.waitMinutes)).toEqual([3, 11]);
  });

  it("infers corridor from destination (Altrincham bound from an Eccles platform)", () => {
    const result = departuresFor(
      [platform({ Line: "Eccles", Dest0: "Altrincham", Wait0: "3" })],
      "SPS",
    );
    expect(result[0]?.corridor).toBe("Altrincham");
  });

  it("keeps the platform corridor for ambiguous destinations (Piccadilly)", () => {
    const result = departuresFor(
      [platform({ Line: "Bury", Dest0: "Piccadilly", Wait0: "3", TLAREF: "MKT" })],
      "MKT",
    );
    expect(result[0]?.corridor).toBe("Bury");
  });

  it("parses 'Single' / 'Double' / '' into 1 / 2 / null carriage counts", () => {
    const result = departuresFor(
      [
        platform({
          Dest0: "Altrincham", Wait0: "1", Carriages0: "Single",
          Dest1: "Altrincham", Wait1: "5", Carriages1: "Double",
          Dest2: "Altrincham", Wait2: "9", Carriages2: "",
        }),
      ],
      "SPS",
    );
    expect(result.map((d) => d.carriages)).toEqual([1, 2, null]);
  });
});

describe("groupByDirection", () => {
  const departures = departuresFor(
    [
      platform({
        TLAREF: "SPS",
        Dest0: "Altrincham", Wait0: "3",
        Dest1: "Bury", Wait1: "5",
        Dest2: "Altrincham", Wait2: "10",
      }),
    ],
    "SPS",
  );

  it("groups departures by destination", () => {
    const groups = groupByDirection(departures);
    expect(groups).toHaveLength(2);
    const altGroup = groups.find((g) => g.terminus === "Altrincham");
    expect(altGroup?.departures).toHaveLength(2);
  });

  it("filters out 'Terminates Here' trams", () => {
    const departuresWithTerminate = departuresFor(
      [
        platform({
          Dest0: "Terminates Here", Wait0: "0",
          Dest1: "Altrincham", Wait1: "3",
        }),
      ],
      "SPS",
    );
    const groups = groupByDirection(departuresWithTerminate);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.terminus).toBe("Altrincham");
  });

  it("labels each group 'Towards {terminus}'", () => {
    const groups = groupByDirection(departures);
    expect(groups.find((g) => g.terminus === "Altrincham")?.label).toBe("Towards Altrincham");
  });

  it("sorts groups by next-departure wait time", () => {
    const groups = groupByDirection(departures);
    // Altrincham next = 3 min; Bury next = 5 min. Altrincham group first.
    expect(groups[0]?.terminus).toBe("Altrincham");
    expect(groups[1]?.terminus).toBe("Bury");
  });

  it("sorts departures within each group by wait time", () => {
    const groups = groupByDirection(departures);
    const alt = groups.find((g) => g.terminus === "Altrincham")!;
    expect(alt.departures.map((d) => d.waitMinutes)).toEqual([3, 10]);
  });
});

describe("messageBoardFor", () => {
  it("returns null when no platforms have a message", () => {
    expect(messageBoardFor([platform({ TLAREF: "SPS" })], "SPS")).toBeNull();
  });

  it("returns the first distinct message", () => {
    const msg = messageBoardFor(
      [
        platform({ TLAREF: "SPS", PIDREF: "A", MessageBoard: "Engineering Work" }),
        platform({ TLAREF: "SPS", PIDREF: "B", MessageBoard: "Engineering Work" }),
      ],
      "SPS",
    );
    expect(msg).toBe("Engineering Work");
  });

  it("ignores platforms not matching the TLAREF", () => {
    const msg = messageBoardFor(
      [
        platform({ TLAREF: "ALT", MessageBoard: "Altrincham only" }),
        platform({ TLAREF: "SPS", MessageBoard: "SPS message" }),
      ],
      "SPS",
    );
    expect(msg).toBe("SPS message");
  });
});

describe("getAnnouncements", () => {
  it("dedupes identical messages across platforms", () => {
    const announcements = getAnnouncements([
      platform({ TLAREF: "SPS", MessageBoard: "Engineering works" }),
      platform({ TLAREF: "ALT", MessageBoard: "Engineering works" }),
      platform({ TLAREF: "BUR", MessageBoard: "Engineering works" }),
    ]);
    expect(announcements).toHaveLength(1);
    expect(announcements[0]?.affectedStations).toEqual(["ALT", "BUR", "SPS"]);
  });

  it("ignores empty messages", () => {
    expect(getAnnouncements([platform({ MessageBoard: "" })])).toEqual([]);
  });

  it("classifies 'no service' as severe", () => {
    const [a] = getAnnouncements([
      platform({ MessageBoard: "No service between A and B." }),
    ]);
    expect(a?.severity).toBe("severe");
  });

  it("classifies 'engineering works' as notice", () => {
    const [a] = getAnnouncements([
      platform({ MessageBoard: "Engineering works through the weekend" }),
    ]);
    expect(a?.severity).toBe("notice");
  });

  it("classifies a benign message as info", () => {
    const [a] = getAnnouncements([
      platform({ MessageBoard: "Welcome to Metrolink" }),
    ]);
    expect(a?.severity).toBe("info");
  });

  it("sorts severe before notice before info", () => {
    const result = getAnnouncements([
      platform({ PIDREF: "A", MessageBoard: "Just a friendly hello" }),
      platform({ PIDREF: "B", MessageBoard: "No service today" }),
      platform({ PIDREF: "C", MessageBoard: "Engineering works ongoing" }),
    ]);
    expect(result.map((r) => r.severity)).toEqual(["severe", "notice", "info"]);
  });
});

describe("fetchMetrolinks", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns parsed JSON on a 2xx response", async () => {
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ value: [platform()] }),
    });
    const res = await fetchMetrolinks();
    expect(res.value).toHaveLength(1);
  });

  it("throws on a non-2xx response", async () => {
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 502,
    });
    await expect(fetchMetrolinks()).rejects.toThrow(/HTTP 502/);
  });
});
