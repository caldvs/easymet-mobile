import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
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

  // The fade strip sits ABOVE the pill and ends flush at the pill's top
  // edge — no blue extends below the tab bar. Pill height is ~58pt (icon
  // + 12pt vertical padding + 1pt border), so the strip's bottom edge
  // lives at `pillBottomOffset + pillHeight` from the screen bottom.
  const pillBottomOffset = Math.max(insets.bottom, 8) + 8;
  const PILL_HEIGHT = 58;
  const FADE_HEIGHT = 96;

  return (
    <>
      {/* Soft fade strip — transparent at top, fully canvas-tinted at the
          bottom edge where it kisses the top of the floating pill. No
          hard bottom line: the strip terminates exactly at the pill's
          top, so the blur and the chrome read as one continuous
          surface. */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: pillBottomOffset + PILL_HEIGHT,
          height: FADE_HEIGHT,
          overflow: "hidden",
        }}
      >
        <BlurView intensity={32} tint="light" style={{ flex: 1 }} />
        <LinearGradient
          colors={["rgba(244,244,251,0)", "rgba(244,244,251,0.85)"]}
          style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
        />
      </View>

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
            alignItems: "stretch",
            paddingHorizontal: 4,
            paddingVertical: 6,
            // Hairline outline so the pill stays visible against very
            // bright canvases where the blur alone would disappear.
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.55)",
            minWidth: 320,
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
                // Equal-width tabs (flex: 1) with the icon stacked over a
                // small label. Active state is conveyed by tint + slight
                // weight bump on the label — no pill chassis behind the
                // tab, which matches the iOS 17/18 tab-bar treatment.
                style={({ pressed }) => ({
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 6,
                  paddingHorizontal: 4,
                  gap: 3,
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
                    fontFamily: isActive ? type.sansSemi : type.sansMedium,
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
        </BlurView>
        </View>
      </View>
    </>
  );
}
