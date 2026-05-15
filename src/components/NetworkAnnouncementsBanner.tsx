import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, View } from "react-native";
import { useDisruptions } from "../lib/DisruptionsContext";
import { activeForBanner } from "../lib/disruptions";
import { pressFeedback } from "./soft/interaction";
import { Banner } from "./soft/Banner";
import type { Tone } from "./soft/tokens";

// Network-wide disruptions banner shown at the top of Home. Sources data
// from the /disruptions endpoint (TfGM travel-alerts) and filters strictly
// to disruptions that are happening RIGHT NOW — upcoming planned works
// belong on the Announcements modal's "Coming up" section, not here.
//
// Renders through the soft kit's `Banner` atom — the previous hand-rolled
// accent/dot/chevron card has been replaced with `tone` semantics, so a
// severe disruption looks identical to any other danger banner in the app.

export function NetworkAnnouncementsBanner() {
  const router = useRouter();
  const { disruptions } = useDisruptions();

  const active = useMemo(() => activeForBanner(disruptions), [disruptions]);

  const severeCount = active.filter((a) => a.severity === "severe").length;
  const noticeCount = active.filter((a) => a.severity === "notice").length;
  const total = active.length;

  // Map the four severity-driven copy variants to soft Banner tones. The
  // banner always renders so the Announcements page stays reachable — a
  // clear network gets a quiet "Good service" success tone.
  let tone: Tone;
  let title: string;
  if (total === 0) {
    tone = "success";
    title = "Good service across the network";
  } else if (severeCount > 0) {
    tone = "danger";
    title =
      severeCount === 1
        ? "Severe disruption on the network"
        : `${severeCount} severe disruptions right now`;
  } else if (noticeCount > 0) {
    tone = "warning";
    title = total === 1 ? "1 service notice right now" : `${total} service notices right now`;
  } else {
    tone = "neutral";
    title = total === 1 ? "1 network update" : `${total} network updates`;
  }

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 }}>
      <Pressable
        onPress={() => router.push("/announcements")}
        style={(state) => pressFeedback(state)}
      >
        <Banner tone={tone} title={title} action="View details" onActionPress={() => router.push("/announcements")} />
      </Pressable>
    </View>
  );
}
