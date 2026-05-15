// Stub of @expo/ui/swift-ui/modifiers. Returns inert configs so calling
// code compiles; the actual visual effect is supplied by the native
// SwiftUI runtime, which doesn't exist on the web. The Host stub
// already ignores `modifiers`, so this just needs the right shapes.

type ModifierConfig = { type: string; params?: unknown };

const make = (type: string) => (params?: unknown): ModifierConfig => ({ type, params });

export const padding = make("padding");
export const glassEffect = make("glassEffect");
export const cornerRadius = make("cornerRadius");
export const background = make("background");
export const foregroundColor = make("foregroundColor");
export const font = make("font");
export const bold = make("bold");
export const frame = make("frame");
