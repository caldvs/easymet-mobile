import { Tabs } from "expo-router";
import { TabBar } from "../../src/components/TabBar";

// Real Tabs navigator (backed by UITabBarController on iOS) so the three
// peer screens stay mounted across switches — scroll positions persist,
// no re-render flash, and the swap is instant. We pass our own Liquid
// Glass `TabBar` as the visual; the navigator handles the lifecycle.
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={() => <TabBar />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: "transparent" },
        // Lazy mount (default) — keeps cold-start fast. Once a tab is
        // mounted it stays mounted, so subsequent switches are still
        // instant. The first-switch-to-each-tab cost is only meaningful
        // in dev mode; production builds (Hermes) make it imperceptible.
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="nearby" />
      <Tabs.Screen name="plan" />
      <Tabs.Screen name="browse" />
      {/* `pinned` content is now the Home screen; the file stays as an
          unreachable redirect to keep imports stable. */}
      <Tabs.Screen name="pinned" options={{ href: null }} />
    </Tabs>
  );
}
