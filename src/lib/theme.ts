// Design tokens. Stripped-back system-iOS look: white surfaces, system
// font, hairline separators, system blue accent. Line corridor colours
// stay (they're functional, not decorative). Frosted-glass / cream /
// display-font era ended.

import { Platform } from "react-native";

const SYSTEM_FONT = Platform.select({
  ios: "System",
  android: "sans-serif",
  default: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
}) as string;

const MONO_FONT = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "ui-monospace, Menlo, Consolas, monospace",
}) as string;

export interface Palette {
  bg: string;
  surface: string;
  /** Solid (fully opaque) variant of `surface` — for chrome that should
   *  never let the orb backdrop bleed through. Tab bar, navigation bars,
   *  bottom sheets behind grouped content. */
  chromeSurface: string;
  fg: string;
  fgMuted: string;
  fgSubtle: string;
  fgFaint: string;
  border: string;
  divider: string;
  accent: string;
  status: { good: string; delayed: string; cancelled: string };
  // Held-over slots from the previous design language so legacy consumers
  // keep compiling without a sweeping refactor. All resolve to plain white
  // / hairline-grey now — no translucent tints.
  surfaceFill: string;
  surfaceFillChrome: string;
  surfaceFillRow: string;
  surfaceBorder: string;
  chromeBorder: string;
  blurTint: "light" | "dark" | "default";
}

export const lightColours: Palette = {
  // Pale lavender off-white — same brightness as systemGroupedBackground
  // but with a hint of indigo/lilac so the canvas picks up the orb palette
  // instead of competing with it. Grey-on-grey merging is the symptom we
  // were trying to avoid; this gives canvas its own gentle hue.
  bg: "#F4F4FB",
  // Card / row surface — 90% white so the orb backdrop tints through a
  // touch. Content stays comfortably legible; the colour gradients lift
  // through enough to read as the canvas, not a feature on the card.
  surface: "rgba(255,255,255,0.9)",
  chromeSurface: "#FFFFFF",
  fg: "#000000",
  // iOS-style label colours: secondary / tertiary / quaternary.
  fgMuted: "rgba(60,60,67,0.6)",
  fgSubtle: "rgba(60,60,67,0.5)",
  fgFaint: "rgba(60,60,67,0.3)",
  // iOS separator (opaque) — used between list rows inside a card.
  border: "rgba(60,60,67,0.12)",
  divider: "rgba(60,60,67,0.18)",
  accent: "#0A84FF",
  status: { good: "#22A06B", delayed: "#C99700", cancelled: "#FF3B30" },
  surfaceFill: "#FFFFFF",
  surfaceFillChrome: "#FFFFFF",
  surfaceFillRow: "#FFFFFF",
  surfaceBorder: "rgba(60,60,67,0.12)",
  chromeBorder: "rgba(60,60,67,0.18)",
  blurTint: "light",
};

export const darkColours: Palette = {
  // iOS dark systemGroupedBackground.
  bg: "#000000",
  // Card / row surface in dark mode — 90% systemGray6 so the orbs bleed
  // through the same way they do in light mode.
  surface: "rgba(28,28,30,0.9)",
  chromeSurface: "#1C1C1E",
  fg: "#FFFFFF",
  fgMuted: "rgba(235,235,245,0.6)",
  fgSubtle: "rgba(235,235,245,0.45)",
  fgFaint: "rgba(235,235,245,0.3)",
  border: "rgba(84,84,88,0.45)",
  divider: "rgba(84,84,88,0.65)",
  accent: "#0A84FF",
  status: { good: "#30D158", delayed: "#FF9F0A", cancelled: "#FF453A" },
  surfaceFill: "#1C1C1E",
  surfaceFillChrome: "#1C1C1E",
  surfaceFillRow: "#1C1C1E",
  surfaceBorder: "rgba(84,84,88,0.45)",
  chromeBorder: "rgba(84,84,88,0.65)",
  blurTint: "dark",
};

export const colours = lightColours;

// All type aliases collapse to the system font. Components keep their
// existing `fontFamily: type.sansMedium` references; weight differentiation
// is now done via fontWeight on text elements where needed (added
// case-by-case rather than via family-naming). v1 will read flatter than
// the DM Sans era — we'll add weight props where the visual hierarchy
// needs it.
export const type = {
  display: SYSTEM_FONT,
  displayLarger: SYSTEM_FONT,
  sans: SYSTEM_FONT,
  sansMedium: SYSTEM_FONT,
  sansSemi: SYSTEM_FONT,
  mono: MONO_FONT,
} as const;

// Weight helpers — supply alongside `fontFamily: type.X` for visual
// hierarchy. iOS RN renders SF Pro at the requested weight automatically.
export const weight = {
  regular: "400",
  medium: "500",
  semi: "600",
  bold: "700",
} as const;

// iOS HIG Dynamic Type scale (Regular sizes). Spread into a `Text` style
// for canonical type. Each preset matches Apple's recommended size/weight
// for that category — staying on-scale keeps the app legible at default
// system size and consistent with native UIKit text.
export const text = {
  largeTitle:  { fontFamily: SYSTEM_FONT, fontSize: 34, fontWeight: "700" as const, letterSpacing: 0.4 },
  title1:      { fontFamily: SYSTEM_FONT, fontSize: 28, fontWeight: "400" as const, letterSpacing: 0.36 },
  title2:      { fontFamily: SYSTEM_FONT, fontSize: 22, fontWeight: "400" as const, letterSpacing: 0.35 },
  title3:      { fontFamily: SYSTEM_FONT, fontSize: 20, fontWeight: "400" as const, letterSpacing: 0.38 },
  headline:    { fontFamily: SYSTEM_FONT, fontSize: 17, fontWeight: "600" as const, letterSpacing: -0.41 },
  body:        { fontFamily: SYSTEM_FONT, fontSize: 17, fontWeight: "400" as const, letterSpacing: -0.41 },
  callout:     { fontFamily: SYSTEM_FONT, fontSize: 16, fontWeight: "400" as const, letterSpacing: -0.32 },
  subheadline: { fontFamily: SYSTEM_FONT, fontSize: 15, fontWeight: "400" as const, letterSpacing: -0.24 },
  footnote:    { fontFamily: SYSTEM_FONT, fontSize: 13, fontWeight: "400" as const, letterSpacing: -0.08 },
  caption1:    { fontFamily: SYSTEM_FONT, fontSize: 12, fontWeight: "400" as const },
  caption2:    { fontFamily: SYSTEM_FONT, fontSize: 11, fontWeight: "400" as const, letterSpacing: 0.07 },
} as const;

export const radii = {
  card: 10,
  cardSmall: 8,
  chip: 999,
  input: 10,
} as const;

export const spacing = (n: number) => n * 4;

// Kept as no-ops so the old soft-UI prototype hooks don't crash. They
// always return the standard treatment now.
export function microLabel(_softUI: boolean) {
  return {
    fontFamily: SYSTEM_FONT,
    letterSpacing: 0,
    textTransform: "none" as const,
  };
}

export function softRadii(_softUI: boolean) {
  return radii;
}

// Accent picker. Default `blue` is iOS system blue; the others are kept
// for users who want a different chrome accent. Line corridor colours
// are unaffected.
export const ACCENTS = {
  blue:     { name: "Blue",     fg: "#0A84FF" },
  graphite: { name: "Graphite", fg: "#3C3C43" },
  forest:   { name: "Forest",   fg: "#22A06B" },
  purple:   { name: "Purple",   fg: "#5E5CE6" },
} as const;

export type AccentId = keyof typeof ACCENTS;
export type Theme = "light" | "dark";
export type TimeFormat = "mins" | "clock";
