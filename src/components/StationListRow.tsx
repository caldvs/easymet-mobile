import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Station } from "../lib/stations";
import { useTheme } from "../lib/TweaksContext";
import { text } from "../lib/theme";
import { Icon } from "./Icon";
import { LineStrip } from "./LineStrip";

export type RowPosition = "first" | "middle" | "last" | "only";

// iOS plain / inset-grouped list row. Pass `position` to opt in to the
// grouped-card visual: rounded corners on first/last, hairline separators
// between siblings, 16pt inset from the grouped backdrop. Omit `position`
// for an edge-to-edge plain row (no inset, no corner clipping).
export function StationListRow({
  station,
  pinned,
  onOpen,
  onTogglePin,
  position,
}: {
  station: Station;
  pinned: boolean;
  onOpen: () => void;
  onTogglePin: () => void;
  position?: RowPosition;
}) {
  const colours = useTheme();
  const grouped = position !== undefined;
  const isFirst = position === "first" || position === "only";
  const isLast = position === "last" || position === "only";
  const showSeparator = !isLast;

  return (
    <View
      style={{
        marginHorizontal: grouped ? 16 : 0,
        marginBottom: isLast ? 24 : 0,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        backgroundColor: colours.surface,
        borderTopLeftRadius: isFirst ? 10 : 0,
        borderTopRightRadius: isFirst ? 10 : 0,
        borderBottomLeftRadius: isLast ? 10 : 0,
        borderBottomRightRadius: isLast ? 10 : 0,
        overflow: "hidden",
      }}
    >
      <Pressable
        onPress={onOpen}
        style={({ pressed }) => ({
          flex: 1,
          minHeight: 44,
          paddingVertical: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          opacity: pressed ? 0.55 : 1,
        })}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ ...text.body, color: colours.fg }} numberOfLines={1}>
            {station.name}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginTop: 3,
            }}
          >
            <LineStrip lines={station.lines} size={7} gap={3} />
            {station.zone != null && (
              <Text style={{ ...text.footnote, color: colours.fgMuted }}>
                Zone {station.zone}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
      <Pressable
        onPress={onTogglePin}
        hitSlop={10}
        style={({ pressed }) => ({ padding: 10, opacity: pressed ? 0.55 : 1 })}
        accessibilityLabel={pinned ? "Unpin station" : "Pin station"}
      >
        <Icon
          name={pinned ? "star" : "star-outline"}
          size={22}
          color={pinned ? colours.accent : colours.fgSubtle}
        />
      </Pressable>
      <Pressable onPress={onOpen} hitSlop={8} style={{ paddingHorizontal: 2 }}>
        <Icon name="chevron-right" size={16} color={colours.fgFaint} />
      </Pressable>
      {showSeparator && (
        <View
          style={{
            position: "absolute",
            left: 16 + 16, // marginHorizontal inside the row inset
            right: 0,
            bottom: 0,
            height: StyleSheet.hairlineWidth,
            backgroundColor: colours.divider,
          }}
        />
      )}
    </View>
  );
}
