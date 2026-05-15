import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { LinearGradient } from "expo-linear-gradient";
import { usePathname, useRouter } from "expo-router";
import { Pressable, Text, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../lib/TweaksContext";
import { type, type Palette } from "../lib/theme";
import { SoftIcon, type IconName } from "./soft/SoftIcon";

// iOS 26 "Liquid Glass" floating tab bar.
//
// On iOS 26+ the chassis is a real `UIVisualEffectView` via the
// `expo-glass-effect` package — Apple's native Liquid Glass material with
// specular highlights, saturated content blur, and accessibility-aware
// tint. On every other platform (Android, older iOS, web/Storybook) we
// fall back to `expo-blur`'s BlurView. Availability is queried once at
// module load; the check doesn't change at runtime.
const HAS_LIQUID_GLASS = isLiquidGlassAvailable();

type Tab = "home" | "nearby" | "plan" | "browse";

const TABS: { id: Tab; label: string; icon: IconName; path: string }[] = [
  { id: "home", label: "Home", icon: "home", path: "/" },
  { id: "nearby", label: "Nearby", icon: "location", path: "/nearby" },
  { id: "plan", label: "Plan", icon: "navigate", path: "/plan" },
  { id: "browse", label: "Browse", icon: "list", path: "/browse" },
];

// Shared chassis style — applied to whichever material (GlassView vs
// BlurView) is in play this build, so swapping the wrapper doesn't shift
// the layout of the row inside.
const CHASSIS_STYLE: ViewStyle = {
  flexDirection: "row",
  alignItems: "stretch",
  paddingHorizontal: 4,
  paddingVertical: 6,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.55)",
  minWidth: 320,
};

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
  // lives at `pillBottomOffset + PILL_HEIGHT` from the screen bottom.
  const pillBottomOffset = Math.max(insets.bottom, 8) + 8;
  const PILL_HEIGHT = 58;
  const FADE_HEIGHT = 96;

  const navigate = (path: string) => router.navigate(path as never);
  const tabsRow = (
    <TabsRow active={active} colours={colours} onNavigate={navigate} />
  );

  return (
    <>
      {/* Soft fade strip — transparent at top, fully canvas-tinted at the
          bottom edge where it kisses the top of the floating pill. */}
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
          bottom: pillBottomOffset,
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
          {HAS_LIQUID_GLASS ? (
            <GlassView
              glassEffectStyle="regular"
              isInteractive
              tintColor={colours.accent}
              style={CHASSIS_STYLE}
            >
              {tabsRow}
            </GlassView>
          ) : (
            <BlurView intensity={70} tint="light" style={CHASSIS_STYLE}>
              {tabsRow}
            </BlurView>
          )}
        </View>
      </View>
    </>
  );
}

// Internal row — extracted so the chassis swap above is a clean if/else
// instead of duplicating the children inline.
function TabsRow({
  active,
  colours,
  onNavigate,
}: {
  active: Tab;
  colours: Palette;
  onNavigate: (path: string) => void;
}) {
  return (
    <>
      {TABS.map((t) => {
        const isActive = active === t.id;
        const tint = isActive ? colours.accent : colours.fgMuted;
        return (
          <Pressable
            key={t.id}
            onPress={() => onNavigate(t.path)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={t.label}
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
    </>
  );
}
