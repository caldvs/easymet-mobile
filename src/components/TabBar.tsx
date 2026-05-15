import { BlurView } from "expo-blur";
import { usePathname, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../lib/TweaksContext";
import { type } from "../lib/theme";
import { SoftIcon, type IconName } from "./soft/SoftIcon";

type Tab = "home" | "nearby" | "plan" | "browse";

// iOS 26 "Liquid Glass" floating tab bar.
//
// Floats above the canvas in a soft-shadowed translucent pill — doesn't
// span edge-to-edge or sit flush at the bottom. The active tab expands
// into a tinted pill that shows both icon and label; inactive tabs
// collapse down to just the icon, so the bar's footprint stays small
// and the canvas keeps breathing room. Backdrop is a BlurView so the
// app's lavender canvas (and the orb backdrop) bleed through.

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
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: Math.max(insets.bottom, 8) + 8,
        alignItems: "center",
      }}
    >
      <View
        style={{
          borderRadius: 32,
          overflow: "hidden",
          shadowColor: "#0a0e2a",
          shadowOpacity: 0.16,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 10 },
          elevation: 8,
        }}
      >
        <BlurView
          intensity={70}
          tint="light"
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 6,
            paddingVertical: 6,
            gap: 4,
            // Hairline outline so the pill stays visible against very
            // bright canvases where the blur alone would disappear.
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.55)",
          }}
        >
          {TABS.map((t) => {
            const isActive = active === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => router.navigate(t.path as never)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={t.label}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  gap: isActive ? 6 : 0,
                  paddingHorizontal: isActive ? 14 : 12,
                  paddingVertical: 10,
                  borderRadius: 24,
                  backgroundColor: isActive ? `${colours.accent}1c` : "transparent",
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <SoftIcon
                  name={t.icon}
                  size={20}
                  color={isActive ? colours.accent : colours.fgMuted}
                  strokeWidth={isActive ? 2.2 : 1.75}
                />
                {isActive && (
                  <Text
                    style={{
                      fontFamily: type.sansSemi,
                      fontWeight: "600",
                      fontSize: 13,
                      letterSpacing: -0.2,
                      color: colours.accent,
                    }}
                    numberOfLines={1}
                  >
                    {t.label}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </BlurView>
      </View>
    </View>
  );
}
