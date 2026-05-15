import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

// iOS 26 native tab bar via UITabBarController in Liquid-Glass mode.
// Expo Router renders this through SwiftUI on the device, so the Liquid
// Glass material, content blur, dynamic compression, and safe-area
// behaviour all come for free — none of it lives in JS.
//
// Each trigger maps to a file under app/(tabs)/. The `sf` prop carries
// the iOS SF Symbol; passing { default, selected } gives the standard
// "outlined when inactive, filled when active" treatment. Files without
// a matching Trigger (legacy `pinned`) stay routable but don't appear
// in the tab bar.
export default function TabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon sf={{ default: "house", selected: "house.fill" }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="nearby">
        <Label>Nearby</Label>
        <Icon sf={{ default: "location", selected: "location.fill" }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="plan">
        <Label>Plan</Label>
        <Icon sf={{ default: "paperplane", selected: "paperplane.fill" }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="browse">
        <Label>Browse</Label>
        <Icon sf="line.3.horizontal.circle" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
