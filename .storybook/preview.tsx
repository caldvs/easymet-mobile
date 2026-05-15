import type { Decorator, Preview } from "@storybook/react-vite";
import { View } from "react-native";
import { BackdropOrbs } from "../src/components/BackdropOrbs";
import { TabBar } from "../src/components/TabBar";
import { DemoProvider } from "../src/lib/DemoMode";
import { DisruptionsProvider } from "../src/lib/DisruptionsContext";
import { DismissedAnnouncementsProvider } from "../src/lib/DismissedAnnouncementsContext";
import { JourneyProvider } from "../src/lib/JourneyContext";
import { NearestLocationProvider } from "../src/lib/NearestLocationContext";
import { TweaksProvider, useTheme, useTweaks } from "../src/lib/TweaksContext";
import { UserProvider } from "../src/lib/UserContext";
import { FavouritesProvider } from "../src/lib/useFavourites";
import "./preview-head.css";

// Global decorator: wrap every story with the same provider stack the app
// uses at runtime, so screen-level stories work without per-story setup.
const withProviders: Decorator = (Story, context) => {
  // Stories can set parameters.routeParams to drive useLocalSearchParams.
  const routeParams = (context.parameters?.routeParams ?? {}) as Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__SB_ROUTE_PARAMS__ = routeParams;

  // Stories can set parameters.pathname to drive the TabBar's active tab
  // (the expo-router stub reads it via usePathname). Defaults to Home
  // so unannotated stories pick up a sensible active state.
  const pathname = (context.parameters?.pathname ?? "/") as string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__SB_PATHNAME__ = pathname;

  // Switch theme based on Storybook's globals (set by the toolbar).
  const theme = (context.globals?.theme ?? "light") as "light" | "dark";
  // Mirror app/_layout.tsx's provider stack so Pinned, Announcements,
  // Plan and Journey all have the contexts they reach for at render time.
  return (
    <TweaksProvider>
      <ThemeBridge theme={theme}>
        <UserProvider>
          <DemoProvider>
            <FavouritesProvider>
              <NearestLocationProvider>
                <JourneyProvider>
                  <DisruptionsProvider>
                    <DismissedAnnouncementsProvider>
                      <ThemedFrame
                        fullBleed={context.parameters?.fullBleed}
                        softKit={context.parameters?.softKit}
                        hideTabBar={context.parameters?.hideTabBar}
                      >
                        <Story />
                      </ThemedFrame>
                    </DismissedAnnouncementsProvider>
                  </DisruptionsProvider>
                </JourneyProvider>
              </NearestLocationProvider>
            </FavouritesProvider>
          </DemoProvider>
        </UserProvider>
      </ThemeBridge>
    </TweaksProvider>
  );
};

// Bridge Storybook's `theme` global to TweaksContext's theme setting.
function ThemeBridge({
  theme,
  children,
}: {
  theme: "light" | "dark";
  children: React.ReactNode;
}) {
  const tweaks = useTweaks();
  if (tweaks.theme !== theme) tweaks.setTheme(theme);
  return <>{children}</>;
}

// Wraps the story in the app's themed canvas + orbs when fullBleed is set,
// otherwise just provides the right background colour for compact stories.
// When `softKit` is set, the story owns the entire canvas itself (the
// soft-UI design-system stories) — skip the app's orbs + lavender bg.
function ThemedFrame({
  fullBleed,
  softKit,
  hideTabBar,
  children,
}: {
  fullBleed?: boolean;
  softKit?: boolean;
  /** Opt out of the bottom TabBar overlay. Default is to show it on
   *  every fullBleed story (matches the production app's tab layout). */
  hideTabBar?: boolean;
  children: React.ReactNode;
}) {
  const colours = useTheme();
  if (softKit) {
    return <View>{children}</View>;
  }
  if (fullBleed) {
    return (
      <View style={{ width: 402, height: 874, backgroundColor: colours.bg, overflow: "hidden" }}>
        <BackdropOrbs />
        {children}
        {!hideTabBar && <TabBar />}
      </View>
    );
  }
  return (
    <View style={{ padding: 16, backgroundColor: colours.bg }}>
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
        <BackdropOrbs />
      </View>
      {children}
    </View>
  );
}

const preview: Preview = {
  decorators: [withProviders],
  globalTypes: {
    theme: {
      name: "Theme",
      description: "App theme (light/dark)",
      defaultValue: "light",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    layout: "centered",
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
  },
};

export default preview;
