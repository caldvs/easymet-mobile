import { type ReactNode, useState } from "react";
import { RefreshControl, ScrollView, type ScrollViewProps } from "react-native";
import { soft, useSoftTheme } from "./tokens";

// ScrollView that hosts a kit-themed pull-to-refresh spinner. Wraps the
// platform RefreshControl with the kit's accent colour, and tracks a
// `refreshing` boolean automatically when `onRefresh` returns a Promise.
//
// Pass children just like ScrollView. The wrapper sets sensible content
// padding so screens compose without an extra container.

export function Refreshable({
  children,
  onRefresh,
  refreshing: controlledRefreshing,
  contentPadding = 16,
  ...rest
}: {
  children: ReactNode;
  /** Returning a promise auto-resets `refreshing` when it resolves. */
  onRefresh: () => void | Promise<void>;
  refreshing?: boolean;
  contentPadding?: number;
} & Omit<ScrollViewProps, "refreshControl" | "children">) {
  const [internal, setInternal] = useState(false);
  const refreshing = controlledRefreshing ?? internal;

  const handle = async () => {
    if (controlledRefreshing == null) setInternal(true);
    try {
      await onRefresh();
    } finally {
      if (controlledRefreshing == null) setInternal(false);
    }
  };

  return (
    <ScrollView
      {...rest}
      contentContainerStyle={[
        { padding: contentPadding, gap: 12 },
        rest.contentContainerStyle,
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handle}
          tintColor={soft.accent}
          colors={[soft.accent]}
          progressBackgroundColor={soft.surface}
        />
      }
    >
      {children}
    </ScrollView>
  );
}
