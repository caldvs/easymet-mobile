import Svg, { Circle, G, Path, Rect } from "react-native-svg";

// Custom thin-stroke SVG icon set per the design spec. 1.6–1.8 px stroke,
// round line caps + joins, 24×24 viewBox. Use the `name` prop to pick a
// glyph. Stroke colour follows the `color` prop; filled variants (the solid
// star + pin) ignore stroke.

type IconName =
  | "search"
  | "star"
  | "star-outline"
  | "chevron-right"
  | "chevron-down"
  | "chevron-up"
  | "back"
  | "pin"
  | "location"
  | "clock"
  | "list"
  | "close"
  | "filter"
  | "refresh"
  | "tram"
  | "arrow-up"
  | "settings"
  | "navigate"
  | "home"
  | "bell";

export function Icon({
  name,
  size = 18,
  color = "#0a0a0a",
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  const stroke = color;
  const fill = color;
  const sw = 1.8;
  switch (name) {
    case "search":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="11" cy="11" r="7" stroke={stroke} strokeWidth={sw} />
          <Path d="m20 20-3.5-3.5" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </Svg>
      );
    case "star":
      // Triple-fill: <Svg fill> + <G fill> + <Path fill>. react-native-svg
      // has historically dropped one or two of these depending on platform
      // + version; setting all three makes the path paint reliably.
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
          <G fill={fill}>
            <Path
              fill={fill}
              fillOpacity={1}
              d="M12 2.5l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.7l-6.1 3.3 1.4-6.8-5.1-4.7 6.9-.7L12 2.5z"
            />
          </G>
        </Svg>
      );
    case "star-outline":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2.5l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.7l-6.1 3.3 1.4-6.8-5.1-4.7 6.9-.7L12 2.5z"
            stroke={stroke}
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "chevron-right":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="m9 6 6 6-6 6" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case "chevron-down":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="m6 9 6 6 6-6" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case "chevron-up":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="m6 15 6-6 6 6" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case "back":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="m14 6-6 6 6 6" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case "arrow-up":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 19V5M5 12l7-7 7 7" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case "pin":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
          <G fill={fill}>
            <Path
              fill={fill}
              fillOpacity={1}
              d="M16 3l5 5-2 2-1-.5L13 14v5l-1 1-4-4 1-1h5L19 9.5 18.5 8.5 16 3z"
            />
          </G>
        </Svg>
      );
    case "location":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 21s-7-7-7-12a7 7 0 0 1 14 0c0 5-7 12-7 12Z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
          <Circle cx="12" cy="9" r="2.5" stroke={stroke} strokeWidth={sw} />
        </Svg>
      );
    case "clock":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth={sw} />
          <Path d="M12 7v5l3 2" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case "list":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4 6h16M4 12h16M4 18h10" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </Svg>
      );
    case "close":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="m6 6 12 12M18 6 6 18" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </Svg>
      );
    case "filter":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4 6h16M7 12h10M10 18h4" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </Svg>
      );
    case "refresh":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M20 7v5h-5" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M4 17v-5h5" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M5 9a8 8 0 0 1 14-1" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M19 15a8 8 0 0 1-14 1" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case "tram":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="5" y="3" width="14" height="14" rx="3" stroke={stroke} strokeWidth={1.6} strokeLinejoin="round" />
          <Path d="M5 9h14" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" />
          <Circle cx="9" cy="13" r="1.2" fill={stroke} />
          <Circle cx="15" cy="13" r="1.2" fill={stroke} />
          <Path d="m8 20-1 2M16 20l1 2" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" />
        </Svg>
      );
    case "settings":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="3" stroke={stroke} strokeWidth={sw} />
          <Path
            d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"
            stroke={stroke}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "navigate":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M3 11l18-8-8 18-2-8z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        </Svg>
      );
    case "home":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3 11.5l9-8 9 8V20a1 1 0 0 1-1 1h-5v-7H10v7H5a1 1 0 0 1-1-1V11.5z"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </Svg>
      );
    case "bell":
      // Lucide-style bell — fills the 24x24 viewBox top-to-bottom so it
      // has the same visual weight as the settings gear at the same
      // render size. Both paths use 1.8 stroke + round caps to match
      // the rest of the icon set.
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <Path
            d="M10.3 21a1.94 1.94 0 0 0 3.4 0"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </Svg>
      );
  }
}
