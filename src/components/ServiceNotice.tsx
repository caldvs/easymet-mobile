import { Text, View } from "react-native";
import { useTheme, useTweaks } from "../lib/TweaksContext";
import { microLabel } from "../lib/theme";
import { Banner } from "./soft/Banner";

// Inset-grouped service notice — now a thin wrapper around the soft kit's
// `Banner` atom. We keep the "Service" eyebrow above the card on Nearby
// (where the section label is part of the page's rhythm), and let the
// banner's own leading icon carry the cue on Station detail.
export function ServiceNotice({
  message,
  showLabel = true,
}: {
  message: string;
  // External section label above the card. Nearby uses it; Station
  // detail prefers an inline eyebrow inside the card.
  showLabel?: boolean;
}) {
  const colours = useTheme();
  const { softUI } = useTweaks();
  const labelStyle = microLabel(softUI);
  return (
    <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
      {showLabel && (
        <Text
          style={{
            fontSize: softUI ? 13 : 11,
            color: colours.fgSubtle,
            marginBottom: 8,
            paddingHorizontal: 4,
            ...labelStyle,
          }}
        >
          Service
        </Text>
      )}
      <Banner
        tone="accent"
        icon="bell"
        title={showLabel ? message : "Service notice"}
        description={showLabel ? undefined : message}
      />
    </View>
  );
}
