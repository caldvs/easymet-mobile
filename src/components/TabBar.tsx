import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { usePathname, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../lib/TweaksContext";
import { type } from "../lib/theme";
import { SoftIcon, type IconName } from "./soft/SoftIcon";

// iOS 26 floating Liquid Glass tab bar. Pill-shaped, floats above the
// canvas with side margins, rounded full radius, real UIVisualEffectView
// material via expo-glass-effect on iOS 26+ (BlurView fallback elsewhere).
//
// Every tab is always visible with icon + label (iOS 17/18 convention —
// no collapsing). Active tab gets the accent colour on icon + label and
// a slight font-weight bump.

type Tab = "home" | "nearby" | "plan" | "browse";

const TABS: { id: Tab; label: string; icon: IconName; path: string }[] = [
  { id: "home", label: "Home", icon: "home", path: "/" },
  { id: "nearby", label: "Nearby", icon: "location", path: "/nearby" },
  { id: "plan", label: "Plan", icon: "navigate", path: "/plan" },
  { id: "browse", label: "Browse", icon: "list", path: "/browse" },
];

// Exposed so consumers (screens, ScrollView contentContainerStyle) can
// reserve enough bottom padding to keep content from sliding under the
// floating bar. ~70pt pill + 12pt margin + safe-area-bottom on device.
export const TAB_BAR_RESERVED_HEIGHT = 96;

const HAS_LIQUID_GLASS = isLiquidGlassAvailable();

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

  const chassisStyle = {
    flexDirection: "row" as const,
    alignItems: "stretch" as const,
    paddingHorizontal: 8,
    paddingVertical: 8,
    minWidth: 320,
  };

  const tabsRow = TABS.map((t) => {
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
          size={22}
          color={tint}
          strokeWidth={isActive ? 2.2 : 1.75}
        />
        <Text
          style={{
            fontFamily: type.sansMedium,
            fontWeight: isActive ? "700" : "500",
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
  });

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        bottom: Math.max(insets.bottom, 12),
      }}
    >
      <View
        style={{
          borderRadius: 28,
          overflow: "hidden",
          shadowColor: "#0a0e2a",
          shadowOpacity: 0.14,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
          elevation: 6,
        }}
      >
        {HAS_LIQUID_GLASS ? (
          <GlassView
            glassEffectStyle="regular"
            isInteractive
            style={chassisStyle}
          >
            {tabsRow}
          </GlassView>
        ) : (
          <BlurView
            intensity={80}
            tint="light"
            style={{
              ...chassisStyle,
              backgroundColor: "rgba(255,255,255,0.7)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.6)",
            }}
          >
            {tabsRow}
          </BlurView>
        )}
      </View>
    </View>
  );
}
