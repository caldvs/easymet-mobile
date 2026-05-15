import { BlurView } from "expo-blur";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../lib/TweaksContext";
import { type } from "../lib/theme";
import { SoftIcon, type IconName } from "./soft/SoftIcon";

type Tab = "home" | "nearby" | "plan" | "browse";

// iOS 26 "Liquid Glass" floating tab bar.
//
// Floats above the canvas in a soft-shadowed translucent pill. The active
// tab expands smoothly into an accent-tinted capsule with icon + label;
// inactive tabs collapse to icon-only. The expansion runs through an
// Animated.Value with a slow ease-out curve so tab switches feel more
// "settle" than "snap" — the original instant-swap read as aggressive.

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
        bottom: Math.max(insets.bottom, 10) + 10,
        alignItems: "center",
      }}
    >
      <View
        style={{
          borderRadius: 36,
          overflow: "hidden",
          shadowColor: "#0a0e2a",
          shadowOpacity: 0.18,
          shadowRadius: 28,
          shadowOffset: { width: 0, height: 12 },
          elevation: 10,
        }}
      >
        <BlurView
          intensity={75}
          tint="light"
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 8,
            paddingVertical: 8,
            gap: 4,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.55)",
          }}
        >
          {TABS.map((t) => (
            <TabItem
              key={t.id}
              tab={t}
              isActive={t.id === active}
              accent={colours.accent}
              muted={colours.fgMuted}
              onPress={() => router.navigate(t.path as never)}
            />
          ))}
        </BlurView>
      </View>
    </View>
  );
}

// One tab. Owns its own Animated.Value so the expansion can interpolate
// padding, label width, label opacity, and the tint of the active pill
// without re-rendering. Duration is deliberately long-ish (320ms) with a
// cubic ease-out so the motion reads as a settle rather than a snap.
function TabItem({
  tab,
  isActive,
  accent,
  muted,
  onPress,
}: {
  tab: { id: Tab; label: string; icon: IconName };
  isActive: boolean;
  accent: string;
  muted: string;
  onPress: () => void;
}) {
  const progress = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(progress, {
      toValue: isActive ? 1 : 0,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      // We're animating layout props (padding, width, backgroundColor),
      // so the native driver isn't an option — stays on the JS thread.
      useNativeDriver: false,
    }).start();
  }, [isActive, progress]);

  const padH = progress.interpolate({ inputRange: [0, 1], outputRange: [14, 18] });
  const padV = progress.interpolate({ inputRange: [0, 1], outputRange: [12, 12] });
  const bgOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.12] });
  // Label slides in: width opens first, then the text fades in once
  // there's enough room — a small stagger reads as deliberate.
  const labelWidth = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 58] });
  const labelOpacity = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });
  const labelGap = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 6] });

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={tab.label}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <Animated.View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: padH,
          paddingVertical: padV,
          borderRadius: 26,
          // Render the accent-tinted background as a separate overlay so we
          // can animate its alpha cleanly without touching the icon's
          // contrast.
          overflow: "hidden",
        }}
      >
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: accent,
            opacity: bgOpacity,
            borderRadius: 26,
          }}
        />
        <SoftIcon
          name={tab.icon}
          size={22}
          color={isActive ? accent : muted}
          strokeWidth={isActive ? 2.2 : 1.75}
        />
        <Animated.View
          style={{ width: labelWidth, opacity: labelOpacity, marginLeft: labelGap, overflow: "hidden" }}
        >
          <Text
            numberOfLines={1}
            style={{
              fontFamily: type.sansSemi,
              fontWeight: "600",
              fontSize: 14,
              letterSpacing: -0.2,
              color: accent,
            }}
          >
            {tab.label}
          </Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}
