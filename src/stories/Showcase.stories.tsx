// Marketing-quality showcase: every app screen rendered inside an iPhone
// frame, with the floating Liquid-Glass tab bar overlaid so the screenshots
// match what the user actually sees on device. These stories are what the
// README's product-page imagery is captured from.

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
import { TabBar } from "../components/TabBar";
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

// Phone wrapper that also seeds the TabBar's active pathname. Screens
// rendered through this wrapper get the live floating tab bar on top —
// matching how the production app composes them via `(tabs)/_layout.tsx`.
function Phone({
  children,
  pathname = "/",
  showTabBar = true,
}: {
  children: React.ReactNode;
  pathname?: string;
  showTabBar?: boolean;
}) {
  // The TabBar reads usePathname() from the expo-router stub which in
  // Storybook reads from this global. Set it on every render so two
  // showcase stories side-by-side don't fight over the value.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__SB_PATHNAME__ = pathname;
  return (
    <IPhoneFrame screenWidth={393} screenHeight={852}>
      <View style={{ flex: 1 }}>
        {children}
        {showTabBar && <TabBar />}
      </View>
    </IPhoneFrame>
  );
}

function SeedFullState({
  name,
  favourites,
}: {
  name: string;
  favourites: ReadonlyArray<string>;
}) {
  const { setName, loaded: userLoaded } = useUser();
  const { favourites: have, toggle, loaded: favsLoaded } = useFavourites();
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
    <Phone pathname="/">
      <SeedFullState name="Callum" favourites={["SPS", "CNK", "ALT"]} />
      <HomeScreen />
    </Phone>
  ),
};

export const Plan: StoryObj = {
  name: "Plan",
  render: () => (
    <Phone pathname="/plan">
      <PlanScreen />
    </Phone>
  ),
};

export const Browse: StoryObj = {
  name: "Browse",
  render: () => (
    <Phone pathname="/browse">
      <BrowseScreen />
    </Phone>
  ),
};

export const Pinned: StoryObj = {
  name: "Pinned",
  render: () => (
    <Phone pathname="/">
      <SeedFullState name="Callum" favourites={["SPS", "CNK", "ALT", "TRB"]} />
      <PinnedScreen />
    </Phone>
  ),
};

// Journey + Station detail + Announcements are pushed screens (not tabs),
// so they hide the tab bar — matches how iOS presents detail flows.
export const Journey: StoryObj = {
  name: "Journey",
  render: () => (
    <Phone pathname="/" showTabBar={false}>
      <SeedJourney fromCode="SPS" toCode="ALT" />
      <JourneyScreen />
    </Phone>
  ),
};

export const StationDetail: StoryObj = {
  name: "Station detail",
  parameters: { routeParams: { code: "AIR" } },
  render: () => (
    <Phone pathname="/" showTabBar={false}>
      <StationDetailScreen />
    </Phone>
  ),
};

export const Announcements: StoryObj = {
  name: "Announcements",
  render: () => (
    <Phone pathname="/" showTabBar={false}>
      <AnnouncementsScreen />
    </Phone>
  ),
};

export const Nearby: StoryObj = {
  name: "Nearby",
  render: () => (
    <Phone pathname="/nearby">
      <NearbyScreen />
    </Phone>
  ),
};
