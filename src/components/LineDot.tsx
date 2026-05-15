import { View } from "react-native";
import { corridorFor } from "../lib/lines";

export function LineDot({ corridor, size = 9 }: { corridor: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: corridorFor(corridor).colour,
      }}
    />
  );
}
