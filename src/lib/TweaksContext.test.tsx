import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { TweaksProvider, useTheme, useTweaks } from "./TweaksContext";
import { ACCENTS, darkColours, lightColours } from "./theme";

const KEY = "easymet:tweaks:v1";

function wrapper({ children }: { children: React.ReactNode }) {
  return <TweaksProvider>{children}</TweaksProvider>;
}

describe("TweaksContext", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("defaults to light theme + blue accent + mins format + non-dense", () => {
    const { result } = renderHook(() => useTweaks(), { wrapper });
    expect(result.current.theme).toBe("light");
    expect(result.current.accent).toBe("blue");
    expect(result.current.timeFormat).toBe("mins");
    expect(result.current.dense).toBe(false);
  });

  it("hydrates persisted tweaks from AsyncStorage", async () => {
    await AsyncStorage.setItem(
      KEY,
      JSON.stringify({ theme: "dark", accent: "forest", timeFormat: "clock", dense: true }),
    );
    const { result } = renderHook(() => useTweaks(), { wrapper });
    await waitFor(() => expect(result.current.theme).toBe("dark"));
    expect(result.current.accent).toBe("forest");
    expect(result.current.timeFormat).toBe("clock");
    expect(result.current.dense).toBe(true);
  });

  it("setTheme switches the active palette", async () => {
    const { result } = renderHook(() => useTweaks(), { wrapper });
    expect(result.current.colours.bg).toBe(lightColours.bg);
    act(() => result.current.setTheme("dark"));
    expect(result.current.colours.bg).toBe(darkColours.bg);
  });

  it("setAccent overrides colours.accent on top of the active theme", async () => {
    const { result } = renderHook(() => useTweaks(), { wrapper });
    act(() => result.current.setAccent("graphite"));
    expect(result.current.colours.accent).toBe(ACCENTS.graphite.fg);
  });

  it("setTimeFormat / setDense flip their flags", () => {
    const { result } = renderHook(() => useTweaks(), { wrapper });
    act(() => result.current.setTimeFormat("clock"));
    expect(result.current.timeFormat).toBe("clock");
    act(() => result.current.setDense(true));
    expect(result.current.dense).toBe(true);
  });

  it("persists tweaks across changes", async () => {
    const { result } = renderHook(() => useTweaks(), { wrapper });
    act(() => result.current.setTheme("dark"));
    await waitFor(async () => {
      const raw = await AsyncStorage.getItem(KEY);
      expect(raw && JSON.parse(raw).theme).toBe("dark");
    });
  });

  it("useTheme returns the active palette", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.bg).toBe(lightColours.bg);
  });
});
