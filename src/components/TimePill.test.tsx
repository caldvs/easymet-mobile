import { render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { describe, expect, it } from "vitest";
import { TweaksProvider, useTweaks } from "../lib/TweaksContext";
import { TimePill } from "./TimePill";

function wrap(ui: React.ReactElement) {
  return render(<TweaksProvider>{ui}</TweaksProvider>);
}

describe("TimePill", () => {
  it("renders 'Due' when wait <= 1", () => {
    wrap(<TimePill waitMinutes={0} status="Due" />);
    expect(screen.getByText("Due")).toBeTruthy();
  });

  it("renders the number + 'min' for wait > 1", () => {
    wrap(<TimePill waitMinutes={5} status="Due" />);
    expect(screen.getByText("5")).toBeTruthy();
    expect(screen.getByText("min")).toBeTruthy();
  });

  it("renders 'delayed' label for Delayed status", () => {
    wrap(<TimePill waitMinutes={7} status="Delayed" />);
    expect(screen.getByText("delayed")).toBeTruthy();
  });

  it("renders 'Cancelled' for Cancelled status", () => {
    wrap(<TimePill waitMinutes={0} status="Cancelled" />);
    expect(screen.getByText("Cancelled")).toBeTruthy();
  });

  it("renders HH:MM clock when timeFormat == 'clock'", async () => {
    function ClockSetter() {
      const { setTimeFormat } = useTweaks();
      useEffect(() => {
        setTimeFormat("clock");
      }, [setTimeFormat]);
      return null;
    }
    wrap(
      <>
        <ClockSetter />
        <TimePill waitMinutes={5} status="Due" />
      </>,
    );
    const found = await screen.findByText(/^\d{2}:\d{2}$/);
    expect(found).toBeTruthy();
  });
});
