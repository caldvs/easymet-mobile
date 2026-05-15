# Live Activity — Design & Implementation

A Lock-Screen Live Activity that mirrors an in-progress Metrolink journey:
where you are on the route, where you're heading, and when the tram reaches
the next stop. Built against ActivityKit / WidgetKit on iOS 16.2+. No
Dynamic Island design beyond the minimal compact / minimal accessories
needed for the system to render the activity at all.

The source of truth for the visual treatment is the Claude Design bundle
at `Live Activity.html` (calm + alight states). This document records what
we built and the decisions behind it.

## Goals

- One glanceable card that answers three questions without unlocking:
  1. Where am I heading?
  2. What's the next stop, and when do we reach it?
  3. Have I arrived / do I need to get off now?
- Minute-precision count-down that actually ticks down between station
  boundaries.
- Match the Claude Design surface treatment: solid card with the alight
  warning state using a red gradient.
- Work with both GPS-tracked progress and a deterministic SIM fallback
  for the iOS Simulator / Expo Go.

## Architecture

Three layers, top to bottom:

```
┌─────────────────────────────────────────────────────────────┐
│  React Native (JS)                                          │
│    src/lib/JourneyContext.tsx                               │
│    └─ derives ContentState from currentIdx + journey state  │
│       and calls startJourneyActivity / updateJourneyActivity│
│                                                             │
│    modules/journey-activity/index.ts                        │
│    └─ TS wrapper around the native module (no-op off-iOS)   │
├─────────────────────────────────────────────────────────────┤
│  Native bridge (Expo Module)                                │
│    modules/journey-activity/ios/JourneyActivityModule.swift │
│    └─ start / update / end → ActivityKit                    │
│                                                             │
│    modules/journey-activity/ios/JourneyActivityAttributes.swift │
│    └─ Shared ActivityAttributes + ContentState              │
├─────────────────────────────────────────────────────────────┤
│  Widget extension                                           │
│    ios/EasymetLiveActivity/EasymetLiveActivityLiveActivity.swift │
│    └─ SwiftUI LockScreenView + minimal DynamicIsland        │
│    └─ Duplicates JourneyActivityAttributes inline           │
└─────────────────────────────────────────────────────────────┘
```

### Why the attributes struct is duplicated

ActivityKit requires the widget extension to see the `ActivityAttributes`
type. The cleanest answer (a shared Swift package) ran into Expo's pod
linkage — pulling the pod into the widget target dragged in React Native
and ExpoModulesCore, which broke the widget's compile budget. Instead the
struct is declared twice with identical field names, types, and ordering;
ActivityKit decodes both via `Codable` and matches by shape, not by type
identity. Any change to one copy must land in the other in the same
commit.

## Data model

`ContentState` — pushed on every update. All fields are required unless
marked optional.

| field                  | type     | purpose                                                    |
|------------------------|----------|------------------------------------------------------------|
| `phase`                | enum     | `boarded` / `inTransit` / `alightNext` / `arrived`         |
| `currentStationName`   | String   | Station the user is nearest (GPS) or simulated as at       |
| `betweenStations`      | Bool     | True when GPS shows the user > 150 m from currentStation   |
| `nextStopName`         | String   | Upcoming station                                           |
| `stopsRemaining`       | Int      | Stops between now and destination                          |
| `minutesToNextStop`    | Int      | Rounded minutes; floor 0 (renders as "now")                |
| `nextStopArrival`      | Date     | Wall-clock arrival at next stop (kept for future timer use)|
| `updatedArrival`       | Date     | ETA at destination                                         |
| `isDelayed`            | Bool     | Reserved — not surfaced in the UI yet                      |
| `transferStationName?` | String?  | Station the user changes line at (multi-line routes)       |
| `transferLineName?`    | String?  | Line they change onto                                      |
| `stopsToTransfer?`     | Int?     | Hops between now and that transfer                         |
| `doorsSide?`           | String?  | `"left"` / `"right"` / `"both"` — used in alight copy      |
| `currentLineColorHex`  | String   | Active line's colour — swaps on transfer boundaries        |

`ActivityAttributes` (static, set at start, never mutated):

| field                  | type     |
|------------------------|----------|
| `lineId`               | String   |
| `lineName`             | String   |
| `lineColorHex`         | String   |
| `originStation`        | String   |
| `destinationStation`   | String   |
| `totalStops`           | Int      |
| `scheduledArrival`     | Date     |

## UI anatomy

```
┌──────────────────────────────────────────────────────────────┐
│  [tile] easymet                                              │  ← top row
│                                                              │
│  Heading to                                          ETA     │  ← header kicker row
│  Wythenshawe Town Centre                            21:04    │  ← header value row
│                                                 9 more stops │  ← summary footnote
│                                                              │
│  ●─┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──○      │  ← rail (middle)
│                                                              │
│  Next stop is Deansgate - Castl…              in 3 min       │  ← footer row
└──────────────────────────────────────────────────────────────┘
```

### Top row
- Line-coloured tile (rounded square with white tram glyph), 24×24
- `easymet` wordmark, 15pt medium

The line identity reads through the tile and rail fill colour — no typed
line name.

### Header — kicker headline + ETA stack
Two columns sitting side by side. Both use the kicker-over-value pattern.

**Left column** — destination:
- Kicker `Heading to` (13pt regular muted) above the destination station
  at 24pt semibold on its own line. The kicker swaps to `Arrived at`
  for the `arrived` phase, or `Doors {left|right} at` / `Alight at` for
  `alightNext`.
- The station name has the full card width (minus the ETA column) to
  wrap into. At 24pt semibold, `Wythenshawe Town Centre` (the longest
  name in the Metrolink network) fits on a single line; anything longer
  truncates with an ellipsis.

**Right column** — ETA stack:
- Kicker `ETA` / `ARR` (10pt tracked subtle)
- Monospaced time `21:04` (22pt medium)
- Footnote `{N} more stops` (11pt muted) — only shown when
  `stopsRemaining > 1`, since the value duplicates phase info at 0 or 1.

### Rail
Same anatomy as before but now positioned in the middle of the card,
not the bottom. Acts as a visual divider between the trip-summary
header above and the immediate-context footer below.

### Footer — next-stop context
- Prefix copy on the left (14pt regular muted) + station name (14pt
  semibold). Count-down right-aligned on the same baseline.

  | state                  | prefix                            | right         |
  |------------------------|-----------------------------------|---------------|
  | en route, `m > 0`      | `Next stop is`                    | `in {m} min`  |
  | at a station, `m == 0` | `Currently at`                    | *(hidden)*    |
  | `alightNext`           | `Doors {left\|right} at` *(or `Alight at`)* | `in {m} min` |
  | `arrived`              | *(footer hidden)*                  | —             |

  The prefix is `.fixedSize` so it never wraps; the station name truncates
  with ellipsis instead. Count-down gets `layoutPriority(1)` so it's
  never squeezed off the line by a long station name.

### Rail
- 3 pt track, line-coloured fill up to `currentIdx / totalStops` progress
- Per-stop ticks (1.5×5 pt) — line-coloured at 0.55 alpha when passed,
  muted otherwise
- Filled origin marker (9 pt) at the left, outlined destination marker
  at the right
- Here-puck: 14 pt white circle with a 3 pt line-coloured stroke and a
  22 pt halo
- Progress clamps to `[0.03, 0.97]` so the puck never overlaps the end
  markers when sitting at the very start or finish

### Surface palette

Colour values pulled straight from the design tokens. Solid (not
translucent) — `.ultraThinMaterial` was rejected because the system tint
greyed out the warm cream / dark ink colours.

| state                 | surface                                          |
|-----------------------|--------------------------------------------------|
| dark scheme (default) | `#16161A`                                        |
| light scheme          | `#FFFCF7`                                        |
| `alightNext`          | linear gradient `#E55934 → #B14225` (top→bottom) |

Text uses `#15151A` / `#F5F5F7` for primary, with `.55 / .38` alpha
ladders for muted / subtle.

The design's intent was a `backdrop-filter: blur(40px)` over the
wallpaper; that effect isn't reproducible in a Live Activity (the system
renders the widget over its own backplate, not the wallpaper), so we
collapse to the solid colour the `rgba(…, 0.78)` over an unknown blur
would average to.

## Phase machine

Phase is derived in `JourneyContext.tsx` from `stopsRemaining` /
`currentIdx`:

```
stopsRemaining === 0           → arrived
stopsRemaining === 1           → alightNext
currentIdx === 0 && stops > 1  → boarded
otherwise                      → inTransit
```

Behaviour per phase:

- **boarded** / **inTransit** — calm surface, "Heading to X" + "Next stop Y"
- **alightNext** — red gradient, kicker copy swaps to "Doors {side} at
  next stop". A medium-strength haptic (`UIImpactFeedbackGenerator`)
  fires once on the `inTransit → alightNext` transition.
- **arrived** — calm surface, single-line "Arrived at X". The activity
  schedules a 60-second auto-dismiss via
  `activity.end(dismissalPolicy: .after(now + 60))` so the final state
  lingers briefly then disappears without JS having to remember to call
  `end`.

## Count-down model

The widget is **self-driving** — it computes its own current state from
the static attributes + wall-clock time, inside a SwiftUI `TimelineView`.
This keeps the count-down ticking even when the app is backgrounded
(JS suspends; iOS continues to schedule renders).

1. **Journey timing lives in attributes, not ContentState.**
   `journeyStartedAt`, `secondsPerStop`, `simSpeedMultiplier`,
   `stationNames`, `lineColorByStation`, `doorsSide` — all set once at
   `start` and immutable. `ContentState` is reduced to just `isDelayed`
   (reserved for future push updates).

2. **TimelineView re-renders the card on a periodic schedule.** The
   cadence is derived from `secondsPerStop` (capped at 30 s, floored at
   5 s, anchored to `journeyStartedAt` so renders line up with leg
   boundaries). Each render recomputes a `JourneySnapshot`:

   ```swift
   let elapsed = now.timeIntervalSince(attributes.journeyStartedAt)
   let currentIdx = min(Int(elapsed / secondsPerStop), stationCount - 1)
   let nextArrival = startedAt + (currentIdx + 1) * secondsPerStop
   let realRemaining = max(0, nextArrival.timeIntervalSince(now))
   let minutesToNextStop = Int((realRemaining * simSpeedMultiplier / 60).rounded())
   ```

3. **`simSpeedMultiplier` scales the displayed minutes.** At 1× this is
   identity; at 4× a 22.5-real-second leg displays as
   `in 2 min → in 1 min → now` instead of rounding straight to 0.

4. **`Currently at <X>` replaces `Next stop <X>` + `now`.** When
   `minutesToNextStop == 0` the widget treats the tram as having
   arrived at the next stop; line 2 swaps copy and the right-hand
   count-down disappears entirely.

5. **JS only fires `start` and `end`.** There is no periodic push from
   JavaScript — the previous architecture had a 30 s interval that
   recomputed and pushed a fresh ContentState, but that froze the
   moment iOS backgrounded the app. The new model removes JS from the
   per-tick loop entirely.

## Door-side data

`src/data/stationDoors.ts` resolves the alight-phase copy from
`(corridor, terminusName, alightStationName) → "left" | "right" | "both"`.

Convention:
- **Default: `"left"`** — most Metrolink stations open on the left.
- `RIGHT_OVERRIDES` and `BOTH_OVERRIDES` tables override the default for
  stations confirmed otherwise. `"both"` (island platforms — Cornbrook,
  St Peter's Square etc.) collapses to the generic "Alight at next stop"
  copy because the cue isn't actionable.

This is hand-curated data. The intent is that observed exceptions get
added to the overrides over time; until then every station says "Doors
left at next stop" during the alight phase.

## Dev tools

`SIM_SPEED_MULTIPLIER` in `src/lib/journey.ts`:

```ts
// 1 = real time, 2 = twice as fast, 4 = four times.
// Reset to 1 before shipping.
export const SIM_SPEED_MULTIPLIER = 1;

export const SIM = {
  secondsPerStop: 90 / SIM_SPEED_MULTIPLIER,
  tickMs: 5000 / SIM_SPEED_MULTIPLIER,
  activityPushMs: 30_000 / SIM_SPEED_MULTIPLIER,
};
```

Scales station progression, journey re-render cadence, and Live Activity
push cadence proportionally. Useful for watching the count-down step
through `in 3 → 2 → 1 → now` in 45 seconds instead of three minutes.
Pure-JS change — no native rebuild needed when you flip it.

## Known limitations / open questions

- **Door-side data is sparse.** Default of `"left"` is wrong for some
  stations. Override tables need real-world observation. Could also be
  inferred from TfGM platform-orientation data if we sourced it.
- **GPS-mode arrival prediction.** We now anchor to `journey.startedAt`
  rather than current position — this means the count-down stays
  predictable even with patchy GPS, but if a journey actually runs
  faster or slower than `secondsPerStop` the count-down drifts from
  real progress. Acceptable for tram-style journeys; would need rework
  for variable-speed transport.
- **Dynamic Island.** Compact / minimal regions are wired with the
  minimum needed for the system to render; there's no design for the
  expanded island region.
- **`betweenStations` flag is now unused in the UI.** The "Heading to /
  Next stop" layout doesn't need it. Field is still in `ContentState`
  in case the model evolves; remove if it stays unused for a release.
- **`isDelayed` is unused.** Plumbed end-to-end but no UI affordance.
- **Multi-leg alight cues.** `alightNext` fires once, one stop before
  the destination. Transfers (`transferStationName`) are in the data
  model but not surfaced — currently the user gets no Live Activity
  warning before a line change. The tile and rail colours DO swap on
  the transfer boundary so the visual identity tracks the active line,
  but there's no text cue for the change itself.
- **iOS 16.2 floor.** ActivityKit's `staleDate` / dismissal-policy APIs
  are 16.2+, so the module's `@available` guards reject anything older.
  Compiles on iOS 15.1 (the pod's deployment target) but the calls are
  no-ops there.

## File map

| path                                                                 | role                              |
|----------------------------------------------------------------------|-----------------------------------|
| `src/lib/JourneyContext.tsx`                                         | Phase derivation, push driver     |
| `src/data/stationDoors.ts`                                           | Door-side overrides + resolver    |
| `src/lib/journey.ts`                                                 | `SIM` constants, route durations  |
| `modules/journey-activity/index.ts`                                  | TS API surface                    |
| `modules/journey-activity/ios/JourneyActivityModule.swift`           | Expo bridge → ActivityKit         |
| `modules/journey-activity/ios/JourneyActivityAttributes.swift`       | Shared attributes (pod copy)      |
| `ios/EasymetLiveActivity/EasymetLiveActivityLiveActivity.swift`      | Widget view + duplicate attributes|
| `designs/Live Activity.html` *(reference)*                           | Source design                     |
