import { Pressable, Text, View } from "react-native";
import type { DirectionGroup } from "../lib/api";
import { corridorFor } from "../lib/lines";
import { useTheme } from "../lib/TweaksContext";
import { type } from "../lib/theme";
import { Icon } from "./Icon";
import { LineDot } from "./LineDot";

export function DirectionHeader({
  group,
  expanded,
  onToggle,
}: {
  group: DirectionGroup;
  expanded: boolean;
  onToggle: () => void;
}) {
  const colours = useTheme();
  const primary = corridorFor(group.lines[0] ?? "");
  const next = group.departures[0];

  // Collapsed peek: next tram time + total count.
  const collapsedSubline = (() => {
    if (!next) return "No upcoming departures";
    const count = group.departures.length;
    const when = next.waitMinutes <= 1 ? "due" : `in ${next.waitMinutes} min`;
    return `${count} departure${count === 1 ? "" : "s"} · next ${when}`;
  })();

  return (
    <Pressable
      onPress={onToggle}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: `${primary.colour}26`,
          borderWidth: 1,
          borderColor: `${primary.colour}66`,
        }}
      >
        <Icon name="arrow-up" size={14} color={primary.colour} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: type.sansSemi,
                  fontWeight: "600",
            fontSize: 15,
            color: colours.fg,
            letterSpacing: -0.2,
          }}
        >
          {group.label}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: type.sans,
            fontSize: 12,
            color: colours.fgMuted,
            marginTop: 2,
          }}
        >
          {expanded ? `via ${group.terminus}` : collapsedSubline}
        </Text>
      </View>
      <View style={{ flexDirection: "row", gap: 4 }}>
        {group.lines.map((line) => (
          <LineDot key={line} corridor={line} size={8} />
        ))}
      </View>
      <View
        style={{
          transform: [{ rotate: expanded ? "180deg" : "0deg" }],
          marginLeft: 4,
        }}
      >
        <Icon name="chevron-down" size={18} color={colours.fgFaint} />
      </View>
    </Pressable>
  );
}
