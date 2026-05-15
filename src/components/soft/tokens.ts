// Soft-UI design tokens. Off-white canvas, white "floating" cards on low
// drop-shadows, gradient accents reserved for AI / primary actions, tonal
// pills for status. Kept in its own file so the kit can live alongside the
// existing iOS-style components without colour-clashing.
//
// Dark mode: every surface / text colour ships in matched light + dark
// variants. Consumers read the active palette via the `useSoftTheme()`
// hook below (which follows the app's `TweaksContext.theme` setting), or
// reach for the static `soft` namespace when they need the light
// palette directly (legacy callers / Storybook).

import { useColorScheme } from "react-native";
import { useTweaks } from "../../lib/TweaksContext";

// ---- Status hues -----------------------------------------------------
// These don't change between light/dark — they're carriers of meaning,
// not background surfaces, so the same hue reads correctly on either bg.
const status = {
  pending:   { fg: "#E2A024", bg: "#F8C84D" },
  submitted: { fg: "#5B7CFA", bg: "#5B7CFA" },
  success:   { fg: "#34C28A", bg: "#34C28A" },
  failed:    { fg: "#F47A7A", bg: "#F47A7A" },
  expired:   { fg: "#B0B0B5", bg: "#B0B0B5" },
  online:    { fg: "#1F9E5B", tint: "#CFEFD9" },
  progress:  { fg: "#3E7BFA", tint: "#DBE6FF" },
};

const gradient = {
  askAI: ["#E03A87", "#F25491", "#FFC6BA"] as const,
  bookCall: ["#7C5BFF", "#A45DFF", "#FF8FA3"] as const,
  askAILarge: ["#F08C5A", "#C66BE0", "#7E6BFF"] as const,
};

const radii = {
  pill: 999,
  card: 14,
  square: 10,
  input: 12,
} as const;

const font = {
  family:
    'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
};

// ---- Shadows ---------------------------------------------------------
// Slightly heavier on dark mode so cards still feel lifted off a darker
// canvas (otherwise the shadow disappears).
const shadowLight = {
  chassis: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  pill: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  raised: {
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
};

const shadowDark = {
  chassis: { ...shadowLight.chassis, shadowOpacity: 0.5, shadowRadius: 28 },
  pill: { ...shadowLight.pill, shadowOpacity: 0.4 },
  raised: { ...shadowLight.raised, shadowOpacity: 0.55 },
};

// ---- Light palette (default) ----------------------------------------
const light = {
  canvas: "#EFEFF2",
  canvasMuted: "#E5E5EA",
  surface: "#FFFFFF",
  surfaceSubtle: "#F4F4F6",
  surfaceInset: "#ECECEF",
  // Divider raised from 0.10 → 0.16 alpha so it stays visible in
  // bright sunlight on light backgrounds (~3:1 contrast).
  divider: "rgba(60,60,67,0.16)",
  text: "#1A1A1F",
  textMuted: "#6E6E76",
  textFaint: "#A8A8AE",
  accent: "#3E7BFA",
  accentSoft: "rgba(62,123,250,0.18)",
  status,
  tone: {
    neutral: { fg: "#1A1A1F", bg: "#1A1A1F", tint: "#ECECEF" },
    accent:  { fg: "#3E7BFA", bg: "#3E7BFA", tint: "#DBE6FF" },
    success: { fg: "#1F9E5B", bg: "#34C28A", tint: "#CFEFD9" },
    warning: { fg: "#A77100", bg: "#E2A024", tint: "#FBE6B0" },
    danger:  { fg: "#C53030", bg: "#F47A7A", tint: "#FBDBDB" },
  },
  gradient,
  shadow: shadowLight,
  radii,
  font,
};

// ---- Dark palette ----------------------------------------------------
// Canvas drops to near-black (matches iOS systemGroupedBackground in dark);
// surfaces lift to systemGray6. Text inverts to a near-white with the same
// hierarchy of muted/faint. Tone tints become darker translucent variants
// so banners read as washes over the dark canvas, not bright cards.
const dark = {
  canvas: "#000000",
  canvasMuted: "#1C1C1E",
  surface: "#1C1C1E",
  surfaceSubtle: "#2C2C2E",
  surfaceInset: "#2C2C2E",
  divider: "rgba(235,235,245,0.18)",
  text: "#F2F2F7",
  textMuted: "rgba(235,235,245,0.6)",
  textFaint: "rgba(235,235,245,0.32)",
  accent: "#5B95FF",
  accentSoft: "rgba(91,149,255,0.22)",
  status,
  tone: {
    neutral: { fg: "#F2F2F7", bg: "#F2F2F7", tint: "#2C2C2E" },
    accent:  { fg: "#5B95FF", bg: "#5B95FF", tint: "rgba(91,149,255,0.18)" },
    success: { fg: "#30D158", bg: "#30D158", tint: "rgba(48,209,88,0.16)" },
    warning: { fg: "#FFD60A", bg: "#FFD60A", tint: "rgba(255,214,10,0.18)" },
    danger:  { fg: "#FF6B6B", bg: "#FF6B6B", tint: "rgba(255,107,107,0.18)" },
  },
  gradient,
  shadow: shadowDark,
  radii,
  font,
};

export type SoftTheme = typeof light;

// Static export — the light palette, kept for legacy / non-component
// callers (e.g. stories that need a colour value at module load). All
// runtime UI code should reach for `useSoftTheme()` instead.
export const soft = light;

// ---- Theme hook ------------------------------------------------------
// Resolution order:
//   1. `tweaks.theme` from TweaksContext if set to a concrete mode
//      (light/dark — gives the user a manual override).
//   2. The OS-level `useColorScheme()` value.
//   3. Light if both are null (Storybook fallback).
export function useSoftTheme(): SoftTheme {
  const os = useColorScheme();
  // `useTweaks` falls back to a default ctx outside a provider — see
  // TweaksContext for the default value. Don't crash Storybook stories
  // that don't mount the provider.
  let tweakTheme: "light" | "dark" | "system" | undefined;
  try {
    tweakTheme = useTweaks().theme as never;
  } catch {
    tweakTheme = undefined;
  }
  const resolved =
    tweakTheme === "light" || tweakTheme === "dark"
      ? tweakTheme
      : os === "dark"
      ? "dark"
      : "light";
  return resolved === "dark" ? dark : light;
}

export type StatusKind = "pending" | "submitted" | "success" | "failed" | "expired";
export type GradientKind = keyof typeof gradient;
export type Tone = keyof typeof light.tone;
