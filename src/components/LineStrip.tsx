import { View } from "react-native";
import { corridorFor } from "../lib/lines";
import { LineDot } from "./LineDot";

// Looks up colours by service-line name. The lines array on a Station comes
// from the Wikipedia augmentation so the names match the design palette
// (Airport / Altrincham / Ashton / Bury / East Didsbury / Eccles /
// Rochdale / Trafford Park).
export function LineStrip({
  lines,
  size = 8,
  gap = 4,
}: {
  lines: readonly string[];
  size?: number;
  gap?: number;
}) {
  return (
    <View style={{ flexDirection: "row", gap, alignItems: "center" }}>
      {lines.map((name) => (
        <LineDot key={name} corridor={lineToCorridor(name)} size={size} />
      ))}
    </View>
  );
}

// The design uses service-line names; corridorFor expects corridor names.
// They match for most lines; the renamed ones are mapped here.
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
