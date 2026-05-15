// Marketing-quality showcase: every app screen rendered inside an iPhone
// frame, seeded so the screenshots look populated rather than empty. These
// stories are what the README's product-page imagery is captured from.

import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect } from "react";
import { View } from "react-native";
import AnnouncementsScreen from "../../app/announcements";
import BrowseScreen from "../../app/(tabs)/browse";
import HomeScreen from "../../app/(tabs)/index";
import JourneyScreen from "../../app/journey";
import NearbyScreen from "../../app/(tabs)/nearby";
import PinnedScreen from "../../app/(tabs)/pinned";
import PlanScreen from "../../app/(tabs)/plan";
import StationDetailScreen from "../../app/station/[code]";
import { IPhoneFrame } from "../components/soft/IPhoneFrame";
import { findRoute } from "../lib/journey";
import { useJourney } from "../lib/JourneyContext";
import { useUser } from "../lib/UserContext";
import { useFavourites } from "../lib/useFavourites";

const meta: Meta = {
  title: "Showcase",
  parameters: {
    layout: "fullscreen",
    softKit: true,
  },
  decorators: [
    (Story) => (
      // Soft canvas backdrop matches the README — phone sits on a pale
      // lavender gradient so the screenshots compose cleanly.
      <View
        style={{
          padding: 32,
          backgroundColor: "#EEF1FA",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Story />
      </View>
    ),
  ],
};
export default meta;

// Render a screen inside the iPhone frame at its native logical size.
function Phone({ children }: { children: React.ReactNode }) {
  return (
    <IPhoneFrame screenWidth={393} screenHeight={852}>
      {children}
    </IPhoneFrame>
  );
}

// Seed user identity + favourite stations so the Home screen is populated
// for the hero shot. Runs once on mount after AsyncStorage has resolved.
function SeedFullState({
  name,
  favourites,
}: {
  name: string;
  favourites: ReadonlyArray<string>;
}) {
  const { setName, loaded: userLoaded } = useUser();
  const { favourites: have, toggle, loaded: favsLoaded } = useFavourites();
  // Gate both seeders on the contexts' `loaded` flags. Otherwise
  // AsyncStorage's resolved value races and overwrites the seed.
  useEffect(() => {
    if (!userLoaded) return;
    setName(name);
  }, [userLoaded, name, setName]);
  useEffect(() => {
    if (!favsLoaded) return;
    for (const c of favourites) if (!have.includes(c)) toggle(c);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favsLoaded]);
  return null;
}

function SeedJourney({ fromCode, toCode }: { fromCode: string; toCode: string }) {
  const { journey, start } = useJourney();
  useEffect(() => {
    if (journey) return;
    const route = findRoute(fromCode, toCode);
    if (route) start(route, fromCode, toCode);
  }, [journey, start, fromCode, toCode]);
  return null;
}

export const Home: StoryObj = {
  name: "Home",
  render: () => (
    <Phone>
      <SeedFullState name="Callum" favourites={["SPS", "CNK", "ALT"]} />
      <HomeScreen />
    </Phone>
  ),
};

export const Plan: StoryObj = {
  name: "Plan",
  render: () => (
    <Phone>
      <PlanScreen />
    </Phone>
  ),
};

export const Browse: StoryObj = {
  name: "Browse",
  render: () => (
    <Phone>
      <BrowseScreen />
    </Phone>
  ),
};

export const Pinned: StoryObj = {
  name: "Pinned",
  render: () => (
    <Phone>
      <SeedFullState name="Callum" favourites={["SPS", "CNK", "ALT", "TRB"]} />
      <PinnedScreen />
    </Phone>
  ),
};

export const Journey: StoryObj = {
  name: "Journey",
  render: () => (
    <Phone>
      <SeedJourney fromCode="SPS" toCode="ALT" />
      <JourneyScreen />
    </Phone>
  ),
};

export const StationDetail: StoryObj = {
  name: "Station detail",
  parameters: { routeParams: { code: "AIR" } },
  render: () => (
    <Phone>
      <StationDetailScreen />
    </Phone>
  ),
};

export const Announcements: StoryObj = {
  name: "Announcements",
  render: () => (
    <Phone>
      <AnnouncementsScreen />
    </Phone>
  ),
};

export const Nearby: StoryObj = {
  name: "Nearby",
  render: () => (
    <Phone>
      <NearbyScreen />
    </Phone>
  ),
};
