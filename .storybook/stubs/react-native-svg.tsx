// Stub of react-native-svg for Storybook. The real package pulls in lots of
// native bridging code that's awkward to bundle for the web. We only use
// Svg, Path, Circle, Rect in the design system (see src/components/Icon.tsx),
// so we map them straight to native HTML SVG elements via React.createElement.
//
// This is a Storybook-only stub. In the app proper, react-native-svg uses
// its built-in `.web.js` files via Expo Metro's resolver, which works fine.

import { createElement } from "react";

interface AnyProps {
  [key: string]: unknown;
  children?: React.ReactNode;
}

function tag(name: string) {
  return function Stub({ children, ...props }: AnyProps) {
    return createElement(name, props as Record<string, unknown>, children);
  };
}

const Svg = tag("svg");
const Path = tag("path");
const Circle = tag("circle");
const Rect = tag("rect");
const G = tag("g");
const Line = tag("line");
const Polyline = tag("polyline");
const Polygon = tag("polygon");
const Defs = tag("defs");
const LinearGradient = tag("linearGradient");
const RadialGradient = tag("radialGradient");
const Stop = tag("stop");
const ClipPath = tag("clipPath");
const Mask = tag("mask");
const Use = tag("use");
const Text = tag("text");
const TSpan = tag("tspan");
const TextPath = tag("textPath");
const Ellipse = tag("ellipse");
const Symbol_ = tag("symbol");

export default Svg;
export {
  Svg,
  Path,
  Circle,
  Rect,
  G,
  Line,
  Polyline,
  Polygon,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  ClipPath,
  Mask,
  Use,
  Text,
  TSpan,
  TextPath,
  Ellipse,
  Symbol_ as Symbol,
};
