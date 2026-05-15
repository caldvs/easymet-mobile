# Roadmap — Easy Met

Feature briefs in priority order. Not yet implemented.

---

## R1 — Crowding hint per departure

**Problem.** Riders want to know if the next tram is packed before they decide to wait for the one after.

**Scope.** A single 3-step indicator on each upcoming-departure row: **quiet · medium · busy**. The signal is inferred — initially from time-of-day + line + day-of-week heuristics, with the data shape ready to accept a real feed later.

**Data.**
- Add `crowding: 'quiet' | 'medium' | 'busy' | null` to the departure shape returned by `generateDepartures`.
- Add `inferCrowding(stationId, lineId, when)` as a pure heuristic helper. Default rules: peak hours (7–9, 17–19) on weekdays → `busy`; off-peak → `medium`; nights/weekends → `quiet`. Override-friendly so a real signal can replace it.

**UI.** A small 3-bar SVG glyph (12 × 12 px) inserted in `DepartureRow` between the carriage count and the time pill. Bars fill 1/2/3 in monochrome — never colour-coded green/red. A tap on the glyph opens a 1-line tooltip ("Usually busy at this time"). Hide the glyph entirely when `crowding == null` so empty data doesn't ship empty UI.

**Acceptance.** Indicator appears on every departure across Now, Station detail, Pinned cards, and the Journey "next stop" card. Density tweak does not hide it. No layout shifts when the value is `null`.

---

## R2 — Live Activity / lock-screen mirror for active journeys

**Problem.** Riders shouldn't have to keep the app foregrounded to see "what's my next stop". The phone should tell them on the lock screen.

**Scope.** A Live Activity that mirrors the Journey screen's "Next stop" card. Renders a line-color glyph, the next station name, stops remaining, and an ETA clock. Updates every 5–15 s using the same `autoIdx`/`currentIdx` derivation the in-app screen uses. Dynamic Island compact + expanded layouts both supported.

**Out of scope.** Push-driven background updates, push tokens. For the first cut, accept that Live Activities only update while the app process can run; document the limitation.

**Implementation notes.**
- Extract the journey-derivation logic (`elapsed → autoIdx → next station → remaining → eta`) into a pure module that both the SwiftUI Live Activity widget and the React UI can call. Currently it lives inline in `journey.jsx`.
- Start the activity when `state.journey` becomes non-null, update on every tick, end it on **End journey** or arrival.

**UI surfaces.** Three: Lock Screen banner, Dynamic Island compact (leading: tram glyph in line color; trailing: stops remaining), Dynamic Island expanded (full next-stop card).

**Acceptance.** Locking the device during an active journey shows the next stop on the lock screen. Tapping the Live Activity reopens the app on the Journey screen. Ending the journey in the app dismisses the activity within one tick.

---

## R3 — Last-tram-of-the-night mode

**Problem.** Between roughly 22:30 and 01:00, the question changes from "when is the next tram" to "can I still get home". The app should answer that without being asked.

**Scope.** A mode that activates automatically when the local time crosses a configurable late-night threshold AND there are ≤ 3 departures remaining tonight on the user's current line. Reverts at the day rollover.

**Data.** Add `lastTramAt(stationId, lineId, dayOfWeek) → Date | null` to the timetable layer. Use real Metrolink last-service times (public-domain) per line/day. Departures generated after this time wrap to the next service day.

**UI.**
- The Now screen's **Next departures** card swaps its header label from `NEXT DEPARTURES` to `LAST SERVICE TONIGHT` in a warm amber accent.
- The top-of-card live indicator's dot changes from green to amber.
- A new row appears at the bottom of the card: `Last tram home: {Towards X} · 23:47` — taps deep-link into Journey mode pre-filled with that direction.
- The app's background tone drops one notch warmer (a subtle 4 % alpha amber overlay on the canvas). All glass surfaces stay the same; only the background flares warm.

**Acceptance.** At 23:00, the Now screen reframes itself with no user input. At 02:00 (post-rollover), it returns to normal. The "Last tram home" row never references a tram whose `mins ≤ 0`. Setting the time-format tweak to **Clock** shows the exact last-service time prominently.

---

## R4 — Multi-line routes with a transfer

**Problem.** `findRoute` currently returns `null` for any trip that needs a line change. About a third of cross-city journeys do.

**Scope.** Support journeys requiring exactly one interchange. Skip two-or-more transfer cases — refuse them with the same polite empty state we use today.

**Data.**
- New helper `findInterchangeRoute(fromId, toId) → null | { segments: Segment[], totalHops, transferStations }` where each `Segment = { lineId, stations }`.
- Algorithm: build the set of stations on lines passing through `fromId`. For each candidate interchange station that's also on a line passing through `toId`, compute the two-segment hops. Return the lowest-total-hop variant; tie-break to the interchange most central in the network (rank: St Peter's Square > Cornbrook > Victoria > Piccadilly Gardens > ...).
- `findRoute` becomes a thin wrapper: try single-line first, fall back to `findInterchangeRoute`.

**UI.**
- Destination picker rows show `via St Peter's Square · 1 change` in their meta line when a route requires a transfer. Single-line routes show line + stops only.
- Journey screen renders one Ladder per segment, stacked. Between segments insert a **TransferCard**: a glass card with a transfer glyph, "Change here · {interchange name}", "Walk to platform: ~2 min", and a second line indicating which line you're boarding next (with its color dot and direction).
- The **Next stop** card is aware of segments — when the rider's `currentIdx` is on the last station of segment 1, the card swaps to "Change here next" with the transfer instructions inline.
- Banner: when on segment 1, says "Change at {interchange} in {n} stops"; when on segment 2, falls back to normal "Next: {stop}".

**Acceptance.** Picking any reachable destination always returns a valid plan or an empty state — never `null` for a station that could be reached with 1 change. Tapping a station in segment 2's ladder before the transfer is impossible (visually disabled, with a hint to complete segment 1 first). The Live Activity from R2 honors segment-aware "next stop" text.

---

## R5 — Plan around a target arrival time

**Problem.** "I need to be at Piccadilly by 9:00" is a different question than "leave now". The app currently can only answer the latter.

**Scope.** Add an **Arrive by** mode to the destination picker; everything else (journey rendering, banner, Live Activity) stays the same — just the framing of times inverts.

**UI.**
- A segmented toggle pinned at the top of the picker sheet: `Leave now | Arrive by`. Default `Leave now`.
- When `Arrive by` is active, a time wheel (or a single-row inline time input — picking the lighter touch first) appears between the toggle and the search box. Default to "in 1 hour" rounded to the nearest 5 min.
- Result rows reframe: `Board at 8:21 — arrives 8:43` (mono for both times). Stop count is moved to the trailing edge as a quieter `8 stops` chip.
- Tapping a row starts the journey with `startedAt` set to the boarding time; the Live Activity / banner show a "Boarding in X min" countdown until the board time arrives, then transition to the normal in-progress state.

**Data.** Existing route-finding suffices. Add `nextBoardingTime(route, arriveByMs)` — works backward from the arrival time minus `route.hops × hopDuration`, finds the tram from `LINE_TIMETABLES` whose origin departure is at or before that boarding time. For the first iteration, use synthetic timetables generated from the existing departure cadence.

**Acceptance.** Switching the toggle re-renders the result list within one frame. Picking a row creates a journey whose hero card reads "Boarding in 14 min" until the board time, then flips to "Next stop". The chosen arrive-by time is never overshot by the displayed plan; rather, the app surfaces a "Earlier than needed by ~3 min" muted note on the journey hero.

---

## R6 — "Alert me when my stop is next"

**Problem.** Riders fall asleep, get absorbed in their phones, or are tourists in a city they don't know. The app already knows the route — it should tell them when to wake up.

**Scope.** Local notifications only — no server, no push. Fire one when the current journey's `currentIdx` reaches `stations.length - 2` (one stop before the destination). Re-fire on the actual destination stop with a "You're here" notification that auto-dismisses the journey if the user doesn't act.

**UI.**
- A 🔔 **Wake me** pill on the Journey screen's hero, sitting next to **End journey**. Two states: **armed** (filled in line color, chime glyph) / **disarmed** (outline, bell glyph).
- A small confirmation toast on arm: "We'll buzz you 1 stop before {destination}."
- When the alert fires, an in-app modal also flashes if the app is foregrounded — a glass card with "Next stop: {destination}" and a primary **Got it** action.
- For multi-leg journeys from R4, also alert at "one stop before transfer".

**Permissions.** Request notification permission lazily on first arming, never on app launch.

**Data.** Add `state.journey.alertArmed: boolean` and `state.journey.alertedAt: number | null`. Schedule the notification with a soft-tolerance timestamp derived from the simulation; when the real signal sources land later, swap in the real ETA.

**Acceptance.** Arming the alert displays the confirmation immediately. The notification fires exactly once per leg per journey. Disarming after arming cancels the scheduled notification (verify the OS reports zero pending notifications for the app after disarm). On arrival, the Live Activity from R2 dismisses simultaneously with the in-app journey state.

---

## R7 — Real service alerts (replaces the hardcoded "Good service" banner)

**Problem.** The Now screen's status card always says "Good service on all lines". This is a lie. Until the disruption model is real, every downstream feature (journeys, alerts, last-tram, history) inherits that lie.

**Scope.** Model line-level service status, surface it consistently everywhere a line appears in the UI, and prioritise affected lines on the Now screen.

**Data.**
- New `LINE_STATUS: Record<LineId, ServiceStatus>` where `ServiceStatus = { level: 'good'|'minor'|'severe'|'part-suspended', summary: string, detail?: string, updatedAt: number }`.
- A `useLineStatus(lineId)` hook reads from a single source of truth (mocked for now, designed to accept a feed).
- Departure generator respects status: `part-suspended` lines produce no departures for affected sections; `severe` doubles gaps; `minor` adds occasional `delayed` flags (re-using the existing field).

**UI surfaces.**
- Line color dots/strips anywhere they appear gain a small status notch — a 4 × 4 px dot to the lower-right, in amber (minor), orange (severe), red (part-suspended), or nothing (good). Same notch on line chips and the journey banner.
- Now screen **SERVICE** card becomes a stack: one card per affected line on top, with full text; one summary line at bottom — "5 other lines: good service". When everything is good, fall back to the existing single card.
- Station detail gains a sticky-top banner when any of the station's lines has `minor` or worse. Inline summary + tap-to-expand for the detail.
- Browse line-filter chips dim or muted when a line is `part-suspended`. Tooltip on tap.
- Journey screen shows a banner above the ladder if the journey's line has `minor` or worse: "Bury line: short trams today, expect crowds at peak". Re-routing suggestions are out of scope for this round — just inform.

**Acceptance.** Flipping `LINE_STATUS['BUR']` from `good` to `severe` updates every visible surface (departure rows, line dots, banners, journey hero, browse chips) within one render cycle. Setting all lines to `good` returns the app to the current single-card summary. No surface refers to "Good service" when the data says otherwise.
