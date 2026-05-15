# Easy Met — design specification

Reference JSX mockups live alongside this file: `app.jsx`, `screens.jsx`, `components.jsx`, `data.jsx`, `ios-frame.jsx`, `tweaks-panel.jsx`, plus screenshots in `screenshots/`. This document is the authoritative spec; the JSX is a working prototype of the same intent.

## Product

A mobile app that surfaces live tram departures for the Manchester Metrolink. Three primary jobs:

- **Now** — at-a-glance live departures from the user's current (or last-chosen) station, plus quick access to other pinned stations.
- **Browse** — a searchable, filterable directory of every Metrolink station, with one-tap pinning.
- **Pinned** — a personal short-list of stations the user has favourited, each showing its next couple of departures inline.

A station detail sheet (push) and a "switch station" bottom sheet (modal) round out the navigation.

## Visual system

### Aesthetic

iOS-style Liquid Glass over a warm, optimistic canvas. The app sits on a soft cream surface (`#F4EFE6` light / `#0B0B0E` dark). Four large blurred color orbs are anchored to the device viewport — coral (top-left), teal (mid-right), amber (mid-left), violet (bottom-right) — so that frosted glass surfaces always have something tinted to blur and saturate over. The orbs are about 280–340 px across, radial-gradient with ~50 % core alpha falling to zero at 70 %, plus an extra 10 px blur on each blob so edges feather softly.

Content surfaces are translucent white (light) or translucent near-black (dark) with `backdrop-filter: blur(28–40px) saturate(180%)` and a hairline inset highlight on the top edge. Text-heavy cards use a relatively solid frost (~0.82 alpha) so legibility wins over translucency; chrome (chips, the "Near you" pill, the tab bar) sits at a lower alpha (~0.45–0.6) so the colored canvas glows through.

### Color

- Surface (light): `#F4EFE6`. Surface (dark): `#0B0B0E`.
- Foreground (light): `#0a0a0a` primary, `rgba(0,0,0,0.5)` secondary, `rgba(0,0,0,0.4)` tertiary.
- Foreground (dark): `#fff` primary, `rgba(255,255,255,0.55)` secondary, `rgba(255,255,255,0.45)` tertiary.
- Pin / favourite accent: `#E55934` (coral) — also the default app accent (theme-switchable).
- Service "good" green: `#22A06B`.
- Delayed / cancelled: `#C2410C`.

Eight line colors (original palette, applied as 4 px-wide left-edge stripes on departure rows, 7–10 px dots in line strips, and 1 px borders on filter chips):

| Line | Hex | Hue |
|---|---|---|
| Altrincham | `#3FA9B5` | teal |
| Bury | `#F2C14E` | amber |
| East Didsbury | `#8E5BD9` | violet |
| Eccles | `#3B82F6` | blue |
| Airport | `#22A06B` | green |
| Ashton | `#60BAEF` | sky |
| Rochdale | `#E55934` | red-orange |
| Trafford Park | `#E94B8A` | pink |

The user can switch the global accent between **Coral**, **Slate**, **Forest**, and **Cobalt** via Tweaks; this affects the pin / star color and tints the primary backdrop orb.

### Type

Three families, all from Google Fonts.

- **Bricolage Grotesque (600)** — display: station names (44 px on Now, 40 px on Station detail, 34 px on Browse / Pinned tab titles). Optical sizing 12..96. Letter-spacing `–0.035em` on hero names, `–0.03em` on tab titles. `text-wrap: balance` for headlines.
- **DM Sans (400 / 500 / 600)** — body, labels, button text, secondary copy. 11–17 px range.
- **JetBrains Mono (400 / 500 / 600)** — tabular numerals only: the minute countdown, the clock-format times, the row indexes on Pinned (`01`, `02`, …), the live timestamp (`13:42`), and the A–Z sticky letter headers in Browse. Always with `font-feature-settings: "tnum"` so columns of digits align.

### Spacing & radii

- App canvas is laid out for a `402 × 874` iOS device frame; content is padded `20px` horizontally inside headlines and `16px` for card columns.
- Card radii: `24px` (primary cards), `20px` (favourite cards), `18px` (pinned chips), `16px` (service banner), `14px` (search input), `999px` (chips, pills, buttons, tab bar).
- Section header label: `11px 600` weight, `0.1em` tracking, uppercase, with `padding: 20px 20px 8px`.
- Section gaps: `28px` between major modules on the Now screen.

### Iconography

A tiny custom SVG set drawn at 1.6–1.8 px stroke, round line caps, round joins. Glyphs used: search, star (filled + outline), chevron right, chevron left/back, pin, location, clock, list, X, filter, refresh, tram. No emoji.

### Elevation

The app uses two shadow languages:

- **Glass shadow** — applied to every frosted card: `inset 0 0.5px 0 rgba(255,255,255,0.85)` for the top-edge shine, plus a soft `0 6px 24px rgba(0,0,0,0.06)` lift. Dark mode uses `0.08` / `0.32` alphas. There is no traditional drop shadow on the page — the glass + orb does that work.
- **Hairline borders** — `0.5px solid rgba(255,255,255,0.65)` (light) / `rgba(255,255,255,0.08)` (dark) on every glass surface.

## Components

### Line dot / line strip

Solid colored circle, 7–10 px depending on context. A **line strip** is a horizontal inline-flex of dots with 3–5 px gap, used to indicate which lines serve a station.

### Line chip

Pill, 12 px label, line color dot + full line name. Light tint background (line color at ~12 % alpha light, ~15 % dark) with a 33 % alpha border in the line color. Used in clusters on Station detail.

### Time pill (right-aligned column inside departure row)

Two stacked rows of mono text. The big number is 30 px when minutes are showing, 22 px when the status is "Due". The lowercase label below it (`min` / `delayed` / `cancelled`) is 11 px 500 weight, lowercase, slightly muted. Delayed turns the entire pill burnt-orange (`#C2410C`). Cancelled replaces the number with the uppercase word `CANCELLED` at 13 px mono. A second time format option renders an HH:MM clock instead of a countdown.

### Departure row

A horizontal flex row, 14 px vertical padding (10 px when "Dense rows" tweak is on). Three columns:

1. **Color stripe** — 4 px wide, full-row height, line color, 999 px radius.
2. **Stack** — destination name (17 px, 500 weight, –0.01 em tracking, ellipsis on overflow) and a meta line (12 px, secondary color): `{line} line · {n} car · Plat {A|B}`. The whole meta line is `white-space: nowrap` with an ellipsis on the first segment so the meta never breaks mid-word.
3. **Time pill** — right-aligned, min-width 56 px.

Rows are separated by 1 px dividers indented to align under the destination column.

### Pin button

36 × 36 grid-centered button, no background. Empty state is an outlined star 1.6 px stroke at the secondary text color. Pinned state swaps to a filled star in the coral accent. No transition on color — toggle is instant; only a `transform .15s` hover hint.

### Tab bar

Floating glass pill at the bottom of the device, absolute, 16 px left/right padding, 32 px bottom padding (clears the iOS home indicator). Three equal-width buttons (Now, Browse, Pinned), each a 10 px-tall icon+label flex group. The active tab is a solid black-on-white (or white-on-black in dark mode) pill inside the larger glass pill. Glass opacity is lower than content cards (~0.55–0.6 light, ~0.45 dark) so the orbs glow through it.

### Sticky section headers

On Browse, A–Z letter headers are sticky to the top of the scroll area, 12 px mono, semi-transparent with `backdrop-filter: blur(20px) saturate(180%)` so the rows beneath them appear to slide under glass.

### Section label

A small `11px, 600 weight, uppercase, 0.1em tracking` label used above lists (`NEXT DEPARTURES`, `PINNED`, `SERVICE`, `SUGGESTED`). Always 20 / 16 px below from previous content.

## Screens

### 1. Now (default landing)

Vertical stack, scrollable, with the bottom tab bar floating over it.

- **Header row** (padded 20 px): a glass-pill chip on the left reading `📍 Near you` and a transparent `Change ›` text button on the right. The `Change` opens the Switch Station sheet.
- **Greeting + station name**: a small muted greeting line ("Good morning." / "Good afternoon." / "Good evening." / "Good night." / "Late night."), then the station name set in Bricolage Grotesque at 44 px, single-line where possible with `text-wrap: balance`. Below it, a row of line dots, a `{n} lines · Zone {z}` muted label, and the pin star.
- **Next departures card** — primary frosted glass surface. Top of the card carries the `NEXT DEPARTURES` label and a live indicator (a 6 px pulsing green dot with a 3 px ring + mono `live · HH:MM`). Five departure rows follow (six in Dense mode), separated by indented dividers. The card ends with a full-width `All departures ›` button on a 0.5 px top divider.
- **Pinned strip** (only shown when the user has pinned stations other than the current one). A `PINNED` section label followed by a horizontal scrollable row of glass chips — each ~170 px wide, showing line dots + filled coral star, station name, and a single peek of `→ {dest} · {n} min` on the bottom.
- **Service** — a green-tinted glass banner: `● Good service on all lines` and a muted timestamp.

### 2. Browse

- `Stations` title (34 px Bricolage Grotesque).
- Glass search input (`Search 99 stations`) with a search glyph and an X clear button.
- Horizontally scrolling line-filter chips. The first chip is `All lines` (neutral); each subsequent chip is a line dot + line name. Selected chips invert to their line color tint at ~26 % alpha with a 0.5 px line-color border; unselected chips are glass on a half-transparent canvas, `white-space: nowrap`.
- Alphabetical list grouped under sticky single-letter headers. Each row: station name (16 px), then meta (`{line dots} · Zone {z}`), with a 36 px star button and a 24 px chevron on the right. Rows have a hairline bottom divider; the entire row except the star is the tap target into Station detail.
- Empty state: `No stations match "{query}" — Try another spelling, or clear the filter.`

### 3. Pinned

- `Pinned` title with `{n} stations` counter aligned baseline.
- A vertically stacked list of glass cards. Each card has:
  - A monospace 2-digit index on the left (`01`, `02`, …).
  - Station name (19 px Bricolage Grotesque).
  - Line dots + Zone meta.
  - A filled coral star (tap to unpin).
  - Two compact departure rows beneath the header, with a divider between them.
- Empty state: a 64 × 64 circular muted ghost button containing an outlined star, the line `No pinned stations yet`, and a `Browse stations` CTA — a black pill (white text) that switches the active tab to Browse.

### 4. Station detail (push)

Replaces the tab bar.

- A small `‹ Back` link at the top-left and a contextual `Pin` / `Pinned` action at the top-right (icon flips, label flips, color flips to coral when active).
- Tiny breadcrumb-style meta: `{area} · Zone {n}` in uppercase 12 px, then the station name at 40 px.
- A wrap of full line chips beneath the title.
- Three direction filter chips: `All`, `Platform A`, `Platform B`. Selected is solid black-on-white (or white-on-black in dark mode); unselected are glass.
- A primary glass card listing up to 14 upcoming departures.

### 5. Switch Station bottom sheet

Triggered from the `Change ›` button on Now. A modal sheet that animates up from the bottom with `cubic-bezier(.2,.7,.2,1)` over 0.28 s; the rest of the screen is dimmed with a 35 % black scrim. Sheet height tops out at 78 % of viewport. Contents:

- A 36 × 4 px drag handle.
- A `Choose a station` title and an X close button.
- A glass search field.
- A `SUGGESTED` list (first 8 stations alphabetically) by default; otherwise filtered search results. Tapping a row sets `currentStation` and closes the sheet. The currently-active station is marked with a coral `Current` label.

## Tweaks panel

A floating panel toggled from the host toolbar. Four controls, two sections:

- **Theme** — segmented radio: `Light` / `Dark`.
- **Theme — Accent** — four-swatch picker (`Coral` / `Slate` / `Forest` / `Cobalt`). Switching changes the favourite/pin color and tints the primary backdrop orb.
- **Departures — Time format** — segmented radio: `Minutes` / `Clock`.
- **Departures — Dense rows** — toggle. Adds one extra departure on the Now card and reduces row padding from 14 px to 10 px.

All four are persisted via the host's edit-mode protocol so they survive reload.

## Data & motion

- A small in-memory dataset of ~38 stations (real Metrolink names, real zones 1–4, real line membership) and 8 lines.
- Departures are generated by a deterministic seeded RNG keyed on `stationId + currentMinute` so they stay stable for one minute and refresh on the next. Each entry has `line`, `destination`, `mins`, `carriages` (1 or 2), `platform` (A or B), and a `status` (on-time, occasionally delayed or cancelled on the first row).
- The Now and Station detail screens re-render every 30 s by polling a local clock and rebucketing.
- The only motion is: the sheet slide-up; minute counters ticking down; the live green pulse on the Next departures header; subtle 180 ms background/color transitions on the tab bar.

## Layout constraints

- Designed inside a `402 × 874` iOS bezel scaled to fit any viewport, centered on a `#1A1A1C` page background.
- Status bar gap is 56 px; tab bar reserves ~80 px at the bottom; content scroller absolutely positions between them with `padding-bottom: 120px` so the last row clears the floating tab bar.
- Every horizontal cluster of siblings (chips, meta lines, line strips) uses flex with `gap` rather than per-element margins, and meta lines are `white-space: nowrap` so words never break mid-token.
