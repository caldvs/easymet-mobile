import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useDisruptions } from "../lib/DisruptionsContext";
import { useDismissedAnnouncements } from "../lib/DismissedAnnouncementsContext";
import { useTheme } from "../lib/TweaksContext";
import { type } from "../lib/theme";
import { Icon } from "./Icon";

// Bell icon for the Home header. Tap → opens the Network Updates page.
// A red dot/badge appears when there are undismissed disruptions; the
// badge count is "unread" — disruptions that the user hasn't acknowledged
// yet. Acknowledged-then-new-arrival cycles are handled by the dismissed
// map being keyed on each disruption's stable ID.
export function NetworkBell() {
  const router = useRouter();
  const colours = useTheme();
  const { disruptions } = useDisruptions();
  const { isDismissed } = useDismissedAnnouncements();

  const unreadCount = useMemo(
    () => disruptions.filter((d) => !isDismissed(d.id)).length,
    [disruptions, isDismissed],
  );

  return (
    <Pressable
      onPress={() => router.push("/announcements")}
      hitSlop={12}
      style={({ pressed }) => ({
        padding: 12,
        minHeight: 44,
        minWidth: 44,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.55 : 1,
      })}
      accessibilityLabel={
        unreadCount > 0 ? `${unreadCount} unread network updates` : "Network updates"
      }
    >
      <Icon name="bell" size={26} color={colours.fg} />
      {unreadCount > 0 && (
        <View
          style={{
            position: "absolute",
            top: 6,
            right: 4,
            minWidth: 20,
            height: 20,
            paddingHorizontal: 5,
            borderRadius: 10,
            backgroundColor: "#FF3B30", // iOS systemRed
            borderWidth: 2,
            borderColor: colours.bg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontFamily: type.sansSemi,
              fontSize: 11,
              fontWeight: "700",
              color: "#FFFFFF",
              includeFontPadding: false,
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
