// Stub of expo-linear-gradient for Storybook. The real package imports
// `TurboModuleRegistry` from react-native, which react-native-web doesn't
// expose — Vite errors with "does not provide an export named
// 'TurboModuleRegistry'". We don't need the native bridge for the design-
// system preview; a plain <div> with a CSS linear-gradient is identical in
// appearance.

import { createElement, type CSSProperties, type ReactNode } from "react";

type Point = { x: number; y: number };

interface Props {
  colors: readonly string[];
  locations?: readonly number[];
  start?: Point;
  end?: Point;
  style?: object;
  children?: ReactNode;
}

function angleFor(start?: Point, end?: Point): number {
  // CSS linear-gradient angle: 0deg points up, increases clockwise.
  const s = start ?? { x: 0, y: 0 };
  const e = end ?? { x: 0, y: 1 };
  const dx = e.x - s.x;
  const dy = e.y - s.y;
  // atan2 gives angle from +x axis CCW. Convert to "0 = up, CW" by:
  // angle_css = 90 - degrees(atan2(-dy, dx))
  const deg = 90 - (Math.atan2(-dy, dx) * 180) / Math.PI;
  return Math.round(((deg % 360) + 360) % 360);
}

function gradientCss(colors: readonly string[], locations?: readonly number[], start?: Point, end?: Point): string {
  const stops = colors.map((c, i) => {
    if (locations && locations[i] != null) {
      return `${c} ${(locations[i] * 100).toFixed(1)}%`;
    }
    return c;
  });
  return `linear-gradient(${angleFor(start, end)}deg, ${stops.join(", ")})`;
}

// Translate the React Native style shorthands the kit actually uses into
// real CSS keys. Without this, RN-isms like `paddingHorizontal` silently
// drop on a DOM <div>, which is why the AI buttons clipped their labels.
function rnToCss(style: object | undefined): CSSProperties {
  const flat: Record<string, unknown> = Array.isArray(style)
    ? Object.assign({}, ...(style as object[]))
    : ((style as Record<string, unknown>) ?? {});
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(flat)) {
    switch (k) {
      case "paddingHorizontal":
        out.paddingLeft = v;
        out.paddingRight = v;
        break;
      case "paddingVertical":
        out.paddingTop = v;
        out.paddingBottom = v;
        break;
      case "marginHorizontal":
        out.marginLeft = v;
        out.marginRight = v;
        break;
      case "marginVertical":
        out.marginTop = v;
        out.marginBottom = v;
        break;
      // Drop RN-only shadow keys — they don't translate cleanly to CSS and
      // the gradient buttons supply their own glow via the wrapper View.
      case "shadowColor":
      case "shadowOffset":
      case "shadowOpacity":
      case "shadowRadius":
      case "elevation":
        break;
      default:
        out[k] = v;
    }
  }
  return out as CSSProperties;
}

export function LinearGradient({ colors, locations, start, end, style, children }: Props) {
  const css: CSSProperties = {
    ...rnToCss(style),
    backgroundImage: gradientCss(colors, locations, start, end),
    display: "inline-flex",
    boxSizing: "border-box",
  };
  return createElement("div", { style: css }, children);
}

export default LinearGradient;
