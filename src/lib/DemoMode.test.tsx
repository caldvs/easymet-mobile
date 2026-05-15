import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, render, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { DemoProvider, useDemoMode } from "./DemoMode";

const KEY = "easymet:demo:v1";

function wrapper({ children }: { children: React.ReactNode }) {
  return <DemoProvider>{children}</DemoProvider>;
}

describe("DemoMode", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("starts loaded=false then becomes true", async () => {
    const { result } = renderHook(() => useDemoMode(), { wrapper });
    await waitFor(() => expect(result.current.loaded).toBe(true));
  });

  it("respects an explicit '1' in storage as on", async () => {
    await AsyncStorage.setItem(KEY, "1");
    const { result } = renderHook(() => useDemoMode(), { wrapper });
    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.demo).toBe(true);
  });

  it("respects an explicit '0' in storage as off (even overnight)", async () => {
    await AsyncStorage.setItem(KEY, "0");
    const { result } = renderHook(() => useDemoMode(), { wrapper });
    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.demo).toBe(false);
  });

  it("toggle flips the flag", async () => {
    const { result } = renderHook(() => useDemoMode(), { wrapper });
    await waitFor(() => expect(result.current.loaded).toBe(true));
    const initial = result.current.demo;
    act(() => result.current.toggle());
    expect(result.current.demo).toBe(!initial);
  });

  it("toggle persists to AsyncStorage", async () => {
    await AsyncStorage.setItem(KEY, "0");
    const { result } = renderHook(() => useDemoMode(), { wrapper });
    await waitFor(() => expect(result.current.loaded).toBe(true));
    act(() => result.current.toggle());
    await waitFor(async () => {
      expect(await AsyncStorage.getItem(KEY)).toBe("1");
    });
  });

  it("renders children inside the provider", () => {
    const { container } = render(
      <DemoProvider>
        <span data-testid="child">x</span>
      </DemoProvider>,
    );
    expect(container.querySelector('[data-testid="child"]')).not.toBeNull();
  });
});
