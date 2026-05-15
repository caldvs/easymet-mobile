import { Text, View } from "react-native";
import { corridorFor } from "../lib/lines";
import { type } from "../lib/theme";
import { LineDot } from "./LineDot";

// Pill with a coloured dot + service-line name. Used on Station detail.
export function LineChip({ line }: { line: string }) {
  const c = corridorFor(lineToCorridor(line));
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 999,
        // Fill alpha bumped from 0x1F (~12%) to 0x26 (~15%) so the corridor
        // tint reads as a chip surface rather than a hint over the canvas.
        backgroundColor: `${c.colour}26`,
        borderWidth: 1,
        borderColor: `${c.colour}55`,
      }}
    >
      <LineDot corridor={lineToCorridor(line)} size={8} />
      <Text style={{ fontFamily: type.sansMedium,
                  fontWeight: "500", fontSize: 12, color: "#1a1a1a" }}>
        {line}
      </Text>
    </View>
  );
}

function lineToCorridor(line: string): string {
  switch (line) {
    case "Ashton":
      return "East Manchester";
    case "East Didsbury":
      return "South Manchester";
    case "Rochdale":
      return "Oldham & Rochdale";
    default:
      return line;
  }
}
