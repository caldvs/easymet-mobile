// Stub of @expo/ui/swift-ui for Storybook. The real package hosts
// SwiftUI views through a native module that Vite can't process. On
// web/Storybook we render a passthrough View; the modifier system
// becomes a no-op so any code using these APIs renders the children
// without the SwiftUI treatment (matches what would happen on Android
// or older iOS at runtime).

import { Text as RNText, View, type TextProps, type ViewProps } from "react-native";

interface HostProps extends ViewProps {
  matchContents?: boolean | { horizontal?: boolean; vertical?: boolean };
  useViewportSizeMeasurement?: boolean;
  ignoreSafeArea?: "all" | "keyboard";
  colorScheme?: "light" | "dark";
}

export function Host({ children, style, ...rest }: HostProps) {
  return (
    <View {...rest} style={style}>
      {children}
    </View>
  );
}

// The SwiftUI Text component — applies modifiers as a no-op on web,
// then renders RN Text inside the Host.
interface SwiftUITextProps extends TextProps {
  modifiers?: unknown[];
}
export function Text({ children, modifiers: _modifiers, ...rest }: SwiftUITextProps) {
  return <RNText {...rest}>{children}</RNText>;
}
