import { NativeTabs } from "expo-router/unstable-native-tabs";

// iOS 26 native tab bar via UITabBarController in Liquid-Glass mode.
// Expo Router renders this through SwiftUI on the device, so the Liquid
// Glass material, content blur, dynamic compression, and safe-area
// behaviour all come for free — none of it lives in JS.
//
// Each trigger maps to a file under app/(tabs)/. SF Symbols carry the
// iOS glyph; the `md` prop carries the Material equivalent for Android.
// The hidden `pinned` file from the previous layout keeps its `href:
// null` semantics implicitly here — files without a Trigger don't get a
// tab slot, but stay routable.
export default function TabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="nearby">
        <NativeTabs.Trigger.Label>Nearby</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="location.fill" md="location_on" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="plan">
        <NativeTabs.Trigger.Label>Plan</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="paperplane.fill" md="send" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="browse">
        <NativeTabs.Trigger.Label>Browse</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="line.3.horizontal.circle.fill" md="grid_view" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
