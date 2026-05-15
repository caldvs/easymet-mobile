// Minimal Ionicons stub: renders the icon name as text. Good enough to
// verify layout in Storybook without loading the real font.

import { Text } from "react-native";

interface Props {
  name?: string;
  size?: number;
  color?: string;
  style?: object;
}

function Ionicons({ name = "?", size = 16, color = "#000", style }: Props) {
  const glyph =
    {
      "star": "★",
      "star-outline": "☆",
      "chevron-back": "‹",
      "chevron-forward": "›",
      "chevron-down": "v",
      "chevron-up": "^",
      "close": "✕",
      "search": "⌕",
      "location-outline": "◯",
      "time-outline": "◷",
      "list-outline": "≡",
      "arrow-up": "↑",
    }[name as string] ?? "•";
  return (
    <Text style={[{ fontSize: size, color, lineHeight: size + 2 }, style ?? {}]}>
      {glyph}
    </Text>
  );
}

export default Ionicons;
export { Ionicons };
