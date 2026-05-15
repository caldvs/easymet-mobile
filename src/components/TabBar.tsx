import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../lib/TweaksContext";
import { type, weight } from "../lib/theme";
import { Icon } from "./Icon";

type Tab = "home" | "nearby" | "plan" | "browse";
type IconName = "home" | "location" | "navigate" | "list";

const TABS: { id: Tab; label: string; icon: IconName; path: string }[] = [
  { id: "home", label: "Home", icon: "home", path: "/" },
  { id: "nearby", label: "Nearby", icon: "location", path: "/nearby" },
  { id: "plan", label: "Plan", icon: "navigate", path: "/plan" },
  { id: "browse", label: "Browse", icon: "list", path: "/browse" },
];

// Standard iOS-style tab bar: solid white surface with a top hairline,
// sits flush at the bottom honouring the home indicator inset. No blur,
// no floating pill, no shadow theatrics.
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
        paddingBottom: insets.bottom,
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
            style={({ pressed }) => ({
              flex: 1,
              paddingTop: 8,
              paddingBottom: 4,
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              opacity: pressed ? 0.55 : 1,
            })}
          >
            <Icon name={t.icon} size={26} color={tint} />
            <Text
              style={{
                fontFamily: type.sansMedium,
                  fontWeight: "500",
                fontSize: 10,
                fontWeight: weight.medium,
                color: tint,
              }}
            >
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
