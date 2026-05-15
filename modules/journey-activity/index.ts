import { EventEmitter, requireNativeModule } from "expo-modules-core";
import { Platform } from "react-native";

// Native module surface — only available on iOS 16.2+. On Android, web,
// and older iOS the calls become no-ops so callers don't need to gate
// every invocation.
//
// The widget computes its own current state (phase, currentIdx,
// minutesToNextStop, etc.) from the static journey attributes inside a
// SwiftUI TimelineView. As a result JS only needs to make two calls:
// `start` (once per journey, passing all the data up front) and `end`
// (when the user cancels). There is no periodic `update` call — the
// widget keeps ticking even when the JS runtime is suspended.

export type DoorSide = "left" | "right" | "both";

export interface JourneyStartArgs {
  lineId: string;
  lineName: string;
  /** First segment's hex colour — used as a fallback if
   *  `lineColorByStation` can't resolve the current index. */
  lineColorHex: string;
  originStation: string;
  destinationStation: string;
  totalStops: number;
  /** ETA at the destination, as epoch seconds. */
  scheduledArrivalEpochSeconds: number;

  /** Wall-clock journey start, as epoch seconds. The widget computes
   *  `currentIdx` from `(now - startedAt) / secondsPerStop`. */
  journeyStartedAtEpochSeconds: number;
  /** Real-world seconds per stop. Combined with simSpeedMultiplier this
   *  drives both leg duration and the displayed-minute count-down. */
  secondsPerStop: number;
  /** Dev knob — displayed minutes are scaled by this so an accelerated
   *  sim still shows realistic "in N min" copy. 1 in production. */
  simSpeedMultiplier: number;

  /** All stations on the route in order, including origin + destination.
   *  Length must be `totalStops + 1`. */
  stationNames: string[];
  /** Active line hex colour at each station. Same length as
   *  `stationNames`. At transfer boundaries the previous line's colour
   *  is used (we stay on the inbound line until the user moves on). */
  lineColorByStation: string[];

  /** Resolved door-side cue for the alight phase. */
  doorsSide?: DoorSide | null;

  /** Reserved for future delay surfacing. */
  isDelayed?: boolean;
}

interface JourneyActivityNative {
  isSupported(): boolean;
  start(args: JourneyStartArgs): Promise<string>;
  end(): Promise<void>;
}

let cached: JourneyActivityNative | null = null;
function native(): JourneyActivityNative | null {
  if (Platform.OS !== "ios") return null;
  if (cached) return cached;
  try {
    cached = requireNativeModule<JourneyActivityNative>("JourneyActivity");
    return cached;
  } catch {
    return null;
  }
}

export function isJourneyActivitySupported(): boolean {
  const n = native();
  return n?.isSupported?.() ?? false;
}

export async function startJourneyActivity(args: JourneyStartArgs): Promise<string | null> {
  const n = native();
  if (!n) return null;
  try {
    return await n.start(args);
  } catch (e) {
    if (__DEV__) console.warn("startJourneyActivity failed:", e);
    return null;
  }
}

export async function endJourneyActivity(): Promise<void> {
  const n = native();
  if (!n) return;
  try {
    await n.end();
  } catch (e) {
    if (__DEV__) console.warn("endJourneyActivity failed:", e);
  }
}

// MARK: Push token plumbing
//
// ActivityKit issues an APNs push token once per activity (sometimes
// rotated). The token identifies the specific activity instance to the
// push server, which uses it (or, in simulator mode, the booted device
// UDID) to deliver updates targeted at this activity.

export interface ActivityPushTokenEvent {
  activityId: string;
  /** Hex-encoded APNs device token. */
  token: string;
}

let emitter: EventEmitter | null = null;
function getEmitter(): EventEmitter | null {
  if (Platform.OS !== "ios") return null;
  if (emitter) return emitter;
  const n = native();
  if (!n) return null;
  try {
    // expo-modules-core 1.x+ — EventEmitter takes the native module.
    emitter = new EventEmitter(n as never);
    return emitter;
  } catch {
    return null;
  }
}

export function addActivityPushTokenListener(
  handler: (event: ActivityPushTokenEvent) => void,
): { remove: () => void } {
  const em = getEmitter();
  if (!em) return { remove: () => undefined };
  const sub = em.addListener("onActivityPushToken", handler);
  return { remove: () => sub.remove() };
}
