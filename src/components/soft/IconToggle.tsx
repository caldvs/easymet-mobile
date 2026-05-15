import { Pressable, Text, View, type TextStyle } from "react-native";
import { minTouch, pressFeedback } from "./interaction";
import { soft } from "./tokens";

// Square rounded toggle — used for B / I / U / alignment buttons inside the
// toolbar. When `selected` the square lifts to a white raised tile (cf. the
// Bold button in image 1 / image 3). When idle, it's transparent and just
// shows its glyph.
export function IconToggle({
  glyph,
  glyphStyle,
  selected = false,
  size,
  onPress,
}: {
  glyph: React.ReactNode;
  glyphStyle?: TextStyle;
  selected?: boolean;
  size?: number;
  onPress?: () => void;
}) {
  // 36 looks right on desktop but is below the iOS/Android minimum touch
  // target. Bump to minTouch (44 on native) when no explicit size is set.
  const resolvedSize = size ?? Math.max(36, minTouch);
  return (
    <Pressable
      onPress={onPress}
      style={(state) => ({
        width: resolvedSize,
        height: resolvedSize,
        borderRadius: soft.radii.square,
        alignItems: "center",
        justifyContent: "center",
        ...(selected ? { backgroundColor: soft.surface, ...soft.shadow.raised } : null),
        ...pressFeedback(state),
      })}
    >
      {typeof glyph === "string" ? (
        <Text
          style={[
            {
              fontFamily: soft.font.family,
              fontSize: 17,
              color: soft.text,
              fontWeight: "600",
            },
            glyphStyle,
          ]}
        >
          {glyph}
        </Text>
      ) : (
        <View>{glyph}</View>
      )}
    </Pressable>
  );
}
