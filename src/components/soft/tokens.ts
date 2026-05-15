// Soft-UI design tokens. Off-white canvas, white "floating" cards on low
// drop-shadows, gradient accents reserved for AI / primary actions, tonal
// pills for status. Kept in its own file so the kit can live alongside the
// existing iOS-style components without colour-clashing.

export const soft = {
  // Canvas + surface
  canvas: "#EFEFF2",
  canvasMuted: "#E5E5EA",
  surface: "#FFFFFF",
  surfaceSubtle: "#F4F4F6",
  surfaceInset: "#ECECEF", // recessed area inside a card
  divider: "rgba(60,60,67,0.10)",

  // Text
  text: "#1A1A1F",
  textMuted: "#6E6E76",
  textFaint: "#A8A8AE",

  // Brand-neutral accent (the blue dot, blue selection highlight)
  accent: "#3E7BFA",
  accentSoft: "rgba(62,123,250,0.18)",

  // Status hues (icon + same-hue text, on white surface)
  status: {
    pending:   { fg: "#E2A024", bg: "#F8C84D" },
    submitted: { fg: "#5B7CFA", bg: "#5B7CFA" },
    success:   { fg: "#34C28A", bg: "#34C28A" },
    failed:    { fg: "#F47A7A", bg: "#F47A7A" },
    expired:   { fg: "#B0B0B5", bg: "#B0B0B5" },
    online:    { fg: "#1F9E5B", tint: "#CFEFD9" },
    progress:  { fg: "#3E7BFA", tint: "#DBE6FF" },
  },

  // Semantic tone palette — used by Button/Banner/Alert variants. Each tone
  // has a solid `fg` (label / icon on a tint background), `bg` (saturated
  // surface for solid variants), and `tint` (pale backdrop for soft
  // variants).
  tone: {
    neutral: { fg: "#1A1A1F", bg: "#1A1A1F", tint: "#ECECEF" },
    accent:  { fg: "#3E7BFA", bg: "#3E7BFA", tint: "#DBE6FF" },
    success: { fg: "#1F9E5B", bg: "#34C28A", tint: "#CFEFD9" },
    warning: { fg: "#A77100", bg: "#E2A024", tint: "#FBE6B0" },
    danger:  { fg: "#C53030", bg: "#F47A7A", tint: "#FBDBDB" },
  },

  // Gradient recipes (use as `colors` prop on LinearGradient)
  gradient: {
    askAI: ["#E03A87", "#F25491", "#FFC6BA"] as const,
    bookCall: ["#7C5BFF", "#A45DFF", "#FF8FA3"] as const,
    askAILarge: ["#F08C5A", "#C66BE0", "#7E6BFF"] as const,
  },

  // Shadow recipes (RN style; rn-web translates to box-shadow)
  // Floating chassis: the toolbar itself sits on a wide soft shadow.
  shadow: {
    chassis: {
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
    },
    // Single pill / button on the canvas.
    pill: {
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    // Active "raised" segment inside a chassis.
    raised: {
      shadowColor: "#000",
      shadowOpacity: 0.10,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },
  },

  radii: {
    pill: 999,
    card: 14,
    square: 10,
    // Input fields (TextField) sit slightly tighter than cards so the
    // border treatment reads as a control, not a container.
    input: 12,
  },

  // Inter is in the codebase already (@expo-google-fonts/dm-sans is loaded
  // by the app; Inter falls back to system on web during dev). Stay system-
  // safe here so storybook doesn't need extra font wiring.
  font: {
    family:
      'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
  },
} as const;

export type StatusKind = "pending" | "submitted" | "success" | "failed" | "expired";
export type GradientKind = keyof typeof soft.gradient;
export type Tone = keyof typeof soft.tone;
