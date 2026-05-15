import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect } from "react";
import AnnouncementsScreen from "../../app/announcements";
import BrowseScreen from "../../app/(tabs)/browse";
import HomeScreen from "../../app/(tabs)/index";
import JourneyScreen from "../../app/journey";
import NearbyScreen from "../../app/(tabs)/nearby";
import PinnedScreen from "../../app/(tabs)/pinned";
import PlanScreen from "../../app/(tabs)/plan";
import StationDetailScreen from "../../app/station/[code]";
import { useFavourites } from "../lib/useFavourites";
import { useJourney } from "../lib/JourneyContext";
import { findRoute } from "../lib/journey";

// All page stories run inside a 402×874 device frame (matches the design's
// iOS bezel) and use the full provider stack from preview.tsx. They render
// against the bundled demo fixture so live data isn't needed.

const meta: Meta = {
  title: "Pages",
  parameters: {
    layout: "fullscreen",
    fullBleed: true,
  },
};

export default meta;

// Each story sets `pathname` so the global TabBar overlay highlights
// the right tab — read by the expo-router stub's usePathname().

export const Home: StoryObj = {
  name: "Home",
  parameters: { pathname: "/" },
  render: () => <HomeScreen />,
};

export const Nearby: StoryObj = {
  name: "Nearby",
  parameters: { pathname: "/nearby" },
  render: () => <NearbyScreen />,
};

export const Browse: StoryObj = {
  name: "Browse",
  parameters: { pathname: "/browse" },
  render: () => <BrowseScreen />,
};

export const Plan: StoryObj = {
  name: "Plan",
  parameters: { pathname: "/plan" },
  render: () => <PlanScreen />,
};

// Pinned needs at least one favourite to read as the populated screen.
// FavouritesContext loads from AsyncStorage asynchronously and overwrites
// whatever's in state when the load resolves — so the seeder has to wait
// for `loaded` before toggling, or the persisted value will clobber it.
function SeedFavourites({ codes }: { codes: ReadonlyArray<string> }) {
  const { favourites, toggle, loaded } = useFavourites();
  useEffect(() => {
    if (!loaded) return;
    for (const c of codes) if (!favourites.includes(c)) toggle(c);
    // Intentionally not depending on `favourites` — re-running on every
    // favourite change creates an oscillating add/remove loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);
  return null;
}

export const Pinned: StoryObj = {
  name: "Pinned",
  parameters: { pathname: "/" },
  render: () => (
    <>
      <SeedFavourites codes={["SPS", "CNK", "ALT"]} />
      <PinnedScreen />
    </>
  ),
};

export const PinnedEmpty: StoryObj = {
  name: "Pinned — empty",
  parameters: { pathname: "/" },
  render: () => <PinnedScreen />,
};

// Detail / overlay screens: Announcements and Station Detail are pushed
// inside a tab so the TabBar stays visible — matches iOS conventions.
export const Announcements: StoryObj = {
  name: "Announcements",
  parameters: { pathname: "/" },
  render: () => <AnnouncementsScreen />,
};

export const StationDetail: StoryObj = {
  name: "Station Detail — St Peter's Square",
  parameters: { routeParams: { code: "SPS" }, pathname: "/browse" },
  render: () => <StationDetailScreen />,
};

export const StationDetailAirport: StoryObj = {
  name: "Station Detail — Manchester Airport",
  parameters: { routeParams: { code: "AIR" }, pathname: "/browse" },
  render: () => <StationDetailScreen />,
};

// Journey screen needs an active journey in state before it'll render —
// the screen redirects to "/" if no journey is set. A tiny seeder hook
// starts one when the story mounts.
function SeedJourney({ fromCode, toCode }: { fromCode: string; toCode: string }) {
  const { journey, start } = useJourney();
  useEffect(() => {
    if (journey) return;
    const route = findRoute(fromCode, toCode);
    if (route) start(route, fromCode, toCode);
  }, [journey, start, fromCode, toCode]);
  return null;
}

export const Journey: StoryObj = {
  name: "Journey — SPS → Altrincham",
  parameters: { pathname: "/plan" },
  render: () => (
    <>
      <SeedJourney fromCode="SPS" toCode="ALT" />
      <JourneyScreen />
    </>
  ),
};

export const JourneyToAirport: StoryObj = {
  name: "Journey — Victoria → Manchester Airport",
  parameters: { pathname: "/plan" },
  render: () => (
    <>
      <SeedJourney fromCode="VIC" toCode="AIR" />
      <JourneyScreen />
    </>
  ),
};
