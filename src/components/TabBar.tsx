import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../lib/TweaksContext";
import { type } from "../lib/theme";
import { SoftIcon, type IconName } from "./soft/SoftIcon";

// Standard iOS tab bar. Flat, edge-to-edge, sits flush at the bottom
// honouring the home-indicator inset. Top hairline border. Background
// matches the surface tone of the canvas so the bar reads as chrome,
// not as a floating widget. Each tab shows an icon stacked over a
// small label; active tab is tinted in the app accent.
//
// (NativeTabs in app/(tabs)/_layout.tsx is what actually renders in
// the production app — it gets iOS 26 Liquid Glass for free via
// UITabBarController. This file is the Storybook fallback only.)

type Tab = "home" | "nearby" | "plan" | "browse";

const TABS: { id: Tab; label: string; icon: IconName; path: string }[] = [
  { id: "home", label: "Home", icon: "home", path: "/" },
  { id: "nearby", label: "Nearby", icon: "location", path: "/nearby" },
  { id: "plan", label: "Plan", icon: "navigate", path: "/plan" },
  { id: "browse", label: "Browse", icon: "list", path: "/browse" },
];

export function TabBar() {
  const colours = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const active: Tab =
    pathname === "/browse"
      ? "browse"
      : pathname === "/nearby"
      ? "nearby"
      : pathname === "/plan"
      ? "plan"
      : "home";

  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colours.chromeSurface,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colours.divider,
        paddingTop: 6,
        paddingBottom: 6 + insets.bottom,
        flexDirection: "row",
      }}
    >
      {TABS.map((t) => {
        const isActive = active === t.id;
        const tint = isActive ? colours.accent : colours.fgMuted;
        return (
          <Pressable
            key={t.id}
            onPress={() => router.navigate(t.path as never)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={t.label}
            style={({ pressed }) => ({
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 4,
              gap: 2,
              opacity: pressed ? 0.55 : 1,
            })}
          >
            <SoftIcon
              name={t.icon}
              size={24}
              color={tint}
              strokeWidth={isActive ? 2.2 : 1.75}
            />
            <Text
              style={{
                fontFamily: type.sansMedium,
                fontWeight: isActive ? "600" : "500",
                fontSize: 10,
                letterSpacing: 0.1,
                color: tint,
              }}
              numberOfLines={1}
            >
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
