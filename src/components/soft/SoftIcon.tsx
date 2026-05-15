// Tiny inline-SVG icon set for the soft-UI kit. We need a handful of
// recognisable glyphs (search, filter funnel, cloud-up, dismiss, chevrons,
// alignment, sparkle, sidebar) and Unicode fallbacks were rendering at the
// wrong size or as emoji on web. SVG paths give us pixel-precise control
// and inherit colour from `color` like a Text node would.

import { Circle, G, Path, Polyline, Rect, Svg } from "react-native-svg";

const PATHS = {
  // 24x24 viewBox. 1.75 stroke, round joins to match a Feather-ish look.
  search: (
    <>
      <Circle cx={11} cy={11} r={7} />
      <Path d="M20 20 L16 16" />
    </>
  ),
  filter: <Path d="M3 5 L21 5 L14 13 L14 20 L10 17 L10 13 Z" />,
  cloudUp: (
    <>
      <Path d="M7 18 H17 a4 4 0 0 0 0.5 -7.95 A6 6 0 0 0 5.5 11 A4 4 0 0 0 7 18 Z" />
      <Path d="M12 14 V8" />
      <Polyline points="9.5 10.5, 12 8, 14.5 10.5" />
    </>
  ),
  close: (
    <>
      <Path d="M6 6 L18 18" />
      <Path d="M18 6 L6 18" />
    </>
  ),
  chevronDown: <Polyline points="6 9, 12 15, 18 9" />,
  chevronUp: <Polyline points="6 15, 12 9, 18 15" />,
  sparkle: (
    <Path d="M12 3 L13.6 9.4 L20 11 L13.6 12.6 L12 19 L10.4 12.6 L4 11 L10.4 9.4 Z" />
  ),
  alignLeft: (
    <>
      <Path d="M4 6 L20 6" />
      <Path d="M4 12 L14 12" />
      <Path d="M4 18 L18 18" />
    </>
  ),
  alignCenter: (
    <>
      <Path d="M4 6 L20 6" />
      <Path d="M7 12 L17 12" />
      <Path d="M5 18 L19 18" />
    </>
  ),
  alignRight: (
    <>
      <Path d="M4 6 L20 6" />
      <Path d="M10 12 L20 12" />
      <Path d="M6 18 L20 18" />
    </>
  ),
  sidebar: (
    <>
      <Rect x={3} y={4} width={18} height={16} rx={2} />
      <Path d="M9 4 L9 20" />
    </>
  ),
  // Italic "I" — top serif, slanted vertical stroke, bottom serif. Drawn
  // rather than rendered as text so it stays recognisable when the host has
  // no italic font available.
  italicI: <Path d="M9 5 L16 5 M13 5 L10 19 M7 19 L14 19" />,
  underlineU: (
    <>
      <Path d="M8 5 L8 12 a4 4 0 0 0 8 0 L16 5" />
      <Path d="M7 19 L17 19" />
    </>
  ),
  boldB: (
    // Filled, weighted glyph — drawn rather than rendered so it looks
    // properly heavy at small sizes even without a bold font available.
    <Path
      d="M7 5 H13.5 a3.2 3.2 0 0 1 1.2 6.2 a3.5 3.5 0 0 1 -1 6.8 H7 Z M10 8 V11 H13 a1.5 1.5 0 0 0 0 -3 Z M10 13.5 V17 H13.5 a1.75 1.75 0 0 0 0 -3.5 Z"
      fillRule="evenodd"
    />
  ),
  info: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M12 8 L12 8.5" />
      <Path d="M12 11 L12 17" />
    </>
  ),
  arrowUpRight: (
    <>
      <Path d="M7 17 L17 7" />
      <Polyline points="9 7, 17 7, 17 15" />
    </>
  ),
  check: <Polyline points="5 12, 10 17, 19 7" />,
  clock: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Polyline points="12 7, 12 12, 16 14" />
    </>
  ),
  chevronLeft: <Polyline points="15 6, 9 12, 15 18" />,
  chevronRight: <Polyline points="9 6, 15 12, 9 18" />,
  plus: (
    <>
      <Path d="M12 5 V19" />
      <Path d="M5 12 H19" />
    </>
  ),
  minus: <Path d="M5 12 H19" />,
  eye: (
    <>
      <Path d="M2 12 C5 6 9 4 12 4 C15 4 19 6 22 12 C19 18 15 20 12 20 C9 20 5 18 2 12 Z" />
      <Circle cx={12} cy={12} r={3.5} />
    </>
  ),
  eyeOff: (
    <>
      <Path d="M3 3 L21 21" />
      <Path d="M10.5 6.5 A12 12 0 0 1 12 6 C15 6 18.5 8 21 12 A18 18 0 0 1 18 15.5" />
      <Path d="M6.5 7.5 C4.5 9 3 10.5 2 12 C4 16 8 18 12 18 C13.5 18 14.9 17.7 16 17.3" />
    </>
  ),
  calendar: (
    <>
      <Rect x={3.5} y={5} width={17} height={15} rx={2} />
      <Path d="M8 3 V7" />
      <Path d="M16 3 V7" />
      <Path d="M3.5 10 H20.5" />
    </>
  ),
  warning: (
    <>
      <Path d="M12 3 L22 20 H2 Z" />
      <Path d="M12 10 V14" />
      <Circle cx={12} cy={17} r={0.6} />
    </>
  ),
  errorOctagon: (
    <>
      <Path d="M8 3 H16 L21 8 V16 L16 21 H8 L3 16 V8 Z" />
      <Path d="M9 9 L15 15" />
      <Path d="M15 9 L9 15" />
    </>
  ),
  heart: <Path d="M12 20 C5 15 3 11 3 8 A4 4 0 0 1 12 6 A4 4 0 0 1 21 8 C21 11 19 15 12 20 Z" />,
  star: (
    <Path d="M12 3 L14.6 9 L21 9.5 L16 13.8 L17.6 20 L12 16.5 L6.4 20 L8 13.8 L3 9.5 L9.4 9 Z" />
  ),
  trash: (
    <>
      <Path d="M4 7 H20" />
      <Path d="M9 7 V5 A2 2 0 0 1 11 3 H13 A2 2 0 0 1 15 5 V7" />
      <Path d="M6 7 L7 20 A2 2 0 0 0 9 22 H15 A2 2 0 0 0 17 20 L18 7" />
    </>
  ),
  home: (
    <>
      <Path d="M4 11 L12 4 L20 11 V20 A1 1 0 0 1 19 21 H14 V14 H10 V21 H5 A1 1 0 0 1 4 20 Z" />
    </>
  ),
  location: (
    <>
      <Path d="M12 22 C7 16 4 13 4 9 A8 8 0 0 1 20 9 C20 13 17 16 12 22 Z" />
      <Circle cx={12} cy={9} r={2.5} />
    </>
  ),
  navigate: <Path d="M3 12 L21 4 L13 21 L11 13 Z" />,
  list: (
    <>
      <Path d="M8 6 H21" />
      <Path d="M8 12 H21" />
      <Path d="M8 18 H21" />
      <Circle cx={4} cy={6} r={1.2} />
      <Circle cx={4} cy={12} r={1.2} />
      <Circle cx={4} cy={18} r={1.2} />
    </>
  ),
  bell: (
    <>
      <Path d="M6 17 H18 L17 15 V11 A5 5 0 0 0 7 11 V15 Z" />
      <Path d="M10 20 A2 2 0 0 0 14 20" />
    </>
  ),
  settings: (
    <>
      <Circle cx={12} cy={12} r={3} />
      <Path d="M12 2 L12 5 M12 19 L12 22 M2 12 L5 12 M19 12 L22 12 M4.9 4.9 L7 7 M17 17 L19.1 19.1 M4.9 19.1 L7 17 M17 7 L19.1 4.9" />
    </>
  ),
  mail: (
    <>
      <Rect x={3} y={5} width={18} height={14} rx={2} />
      <Path d="M3 7 L12 13 L21 7" />
    </>
  ),
  lock: (
    <>
      <Rect x={5} y={11} width={14} height={10} rx={2} />
      <Path d="M8 11 V8 A4 4 0 0 1 16 8 V11" />
    </>
  ),
  user: (
    <>
      <Circle cx={12} cy={8} r={4} />
      <Path d="M4 21 C4 16 8 13 12 13 C16 13 20 16 20 21" />
    </>
  ),
  chat: (
    <>
      <Path d="M4 5 H20 A1 1 0 0 1 21 6 V17 A1 1 0 0 1 20 18 H9 L5 22 V18 H4 A1 1 0 0 1 3 17 V6 A1 1 0 0 1 4 5 Z" />
    </>
  ),
  // Two opposing horizontal arrows — the classic "swap" affordance used
  // for From/To switching, currency converters, route reversal, etc.
  swap: (
    <>
      <Path d="M4 8 H17" />
      <Polyline points="14 5, 17 8, 14 11" />
      <Path d="M20 16 H7" />
      <Polyline points="10 13, 7 16, 10 19" />
    </>
  ),
  // Mark a circular avatar fallback when no image is available.
  personFill: (
    <Path
      d="M12 3 A4 4 0 1 1 12 11 A4 4 0 1 1 12 3 Z M4 21 C4 16 8 13 12 13 C16 13 20 16 20 21 Z"
      fillRule="evenodd"
    />
  ),
} as const;

export type IconName = keyof typeof PATHS;

export function SoftIcon({
  name,
  size = 16,
  color = "#1A1A1F",
  /** Stroke-style icons take a width. Filled ones (boldB) ignore it. */
  strokeWidth = 1.75,
  /** Pass true for filled-style icons (currently just boldB). */
  filled = false,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  filled?: boolean;
}) {
  const isFilled = filled || name === "boldB" || name === "sparkle" || name === "personFill";
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G
        stroke={isFilled ? "none" : color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={isFilled ? color : "none"}
      >
        {PATHS[name]}
      </G>
    </Svg>
  );
}
