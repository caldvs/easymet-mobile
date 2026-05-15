import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { JourneyProvider, useJourney } from "./JourneyContext";
import { findRoute, SIM } from "./journey";

function wrapper({ children }: { children: React.ReactNode }) {
  return <JourneyProvider>{children}</JourneyProvider>;
}

describe("JourneyContext", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-13T12:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with no journey and currentIdx 0", () => {
    const { result } = renderHook(() => useJourney(), { wrapper });
    expect(result.current.journey).toBeNull();
    expect(result.current.currentIdx).toBe(0);
  });

  it("start() sets the journey with startedAt = now", () => {
    const { result } = renderHook(() => useJourney(), { wrapper });
    const route = findRoute("ALT", "SPS")!;
    act(() => result.current.start(route, "ALT", "SPS"));
    expect(result.current.journey?.route.lineId).toBe("Altrincham");
    expect(result.current.journey?.startedAt).toBe(Date.now());
  });

  it("currentIdx auto-advances as time elapses", () => {
    const { result } = renderHook(() => useJourney(), { wrapper });
    const route = findRoute("ALT", "SPS")!;
    act(() => result.current.start(route, "ALT", "SPS"));
    expect(result.current.currentIdx).toBe(0);
    // Advance fake clock by 2 stops worth of seconds.
    act(() => {
      vi.advanceTimersByTime(SIM.secondsPerStop * 1000 * 2 + SIM.tickMs);
    });
    expect(result.current.currentIdx).toBe(2);
  });

  it("currentIdx clamps at the final station", () => {
    const { result } = renderHook(() => useJourney(), { wrapper });
    const route = findRoute("ALT", "TFB")!;
    act(() => result.current.start(route, "ALT", "TFB"));
    act(() => {
      vi.advanceTimersByTime(SIM.secondsPerStop * 1000 * 100 + SIM.tickMs);
    });
    expect(result.current.currentIdx).toBe(route.stations.length - 1);
  });

  // The old tap-to-override `setIdx` API was removed: progress is now
  // driven exclusively by GPS (with a time-based fallback when location
  // is unavailable). We don't allow users to spoof their position on the
  // ladder by tapping a station.

  it("end() clears the journey", () => {
    const { result } = renderHook(() => useJourney(), { wrapper });
    const route = findRoute("ALT", "SPS")!;
    act(() => result.current.start(route, "ALT", "SPS"));
    expect(result.current.journey).not.toBeNull();
    act(() => result.current.end());
    expect(result.current.journey).toBeNull();
  });
});
