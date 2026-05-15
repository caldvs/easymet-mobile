import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { pressFeedback } from "./interaction";
import { SoftIcon, type IconName } from "./SoftIcon";
import { soft, useSoftTheme } from "./tokens";

// Bottom navigation chrome. White surface flush at the bottom edge,
// hairline top border, safe-area inset honoured for the home indicator.
// Active tab gets the accent colour on icon + label and a soft tint pill
// behind the icon (the iOS / Material 3 hybrid pattern).

export type BottomTab<T extends string> = {
  id: T;
  label: string;
  icon: IconName;
  /** Optional unread / badge counter. */
  badge?: number;
};

export function BottomTabBar<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: ReadonlyArray<BottomTab<T>>;
  active: T;
  onChange?: (next: T) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: soft.surface,
        borderTopWidth: 1,
        borderTopColor: soft.divider,
        paddingTop: 6,
        paddingBottom: 6 + insets.bottom,
        paddingHorizontal: 8,
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange?.(tab.id)}
            style={(state) => ({
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              paddingVertical: 6,
              ...pressFeedback(state),
            })}
          >
            <View
              style={{
                width: 56,
                height: 30,
                borderRadius: 15,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isActive ? soft.accentSoft : "transparent",
                position: "relative",
              }}
            >
              <SoftIcon
                name={tab.icon}
                size={20}
                color={isActive ? soft.accent : soft.textMuted}
                strokeWidth={isActive ? 2.25 : 1.75}
              />
              {tab.badge != null && tab.badge > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -2,
                    right: 4,
                    minWidth: 16,
                    height: 16,
                    paddingHorizontal: 4,
                    borderRadius: 8,
                    backgroundColor: soft.tone.danger.fg,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 2,
                    borderColor: soft.surface,
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontFamily: soft.font.family,
                      fontSize: 9,
                      fontWeight: "700",
                    }}
                  >
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={{
                fontFamily: soft.font.family,
                color: isActive ? soft.accent : soft.textMuted,
                fontSize: 11,
                fontWeight: isActive ? "700" : "500",
                letterSpacing: -0.1,
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
