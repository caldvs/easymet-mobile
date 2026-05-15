import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { enableScreens } from "react-native-screens";
import { BackdropOrbs } from "../src/components/BackdropOrbs";

// `react-native-screens` is off-by-default on web, which makes
// `@react-navigation/bottom-tabs` skip its `MaybeScreen` wrapper and fall
// back to a plain `View` — so inactive tabs stay visible (no `display:
// none`) and stack on top of each other once they've each been visited
// once. Turning it on routes inactive scenes through `Screen.web.tsx`,
// which sets `display: none` for any tab that isn't focused.
enableScreens();
import { DemoProvider } from "../src/lib/DemoMode";
import { DisruptionsProvider } from "../src/lib/DisruptionsContext";
import { DismissedAnnouncementsProvider } from "../src/lib/DismissedAnnouncementsContext";
import { JourneyProvider } from "../src/lib/JourneyContext";
import { NearestLocationProvider } from "../src/lib/NearestLocationContext";
import { TweaksProvider, useTheme, useTweaks } from "../src/lib/TweaksContext";
import { UserProvider } from "../src/lib/UserContext";
import { FavouritesProvider } from "../src/lib/useFavourites";

const TransparentTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: "transparent", card: "transparent" },
};

export default function RootLayout() {
  return (
    <TweaksProvider>
      <UserProvider>
        <DemoProvider>
          <FavouritesProvider>
            <NearestLocationProvider>
              <JourneyProvider>
                <DisruptionsProvider>
                  <DismissedAnnouncementsProvider>
                    <ThemeProvider value={TransparentTheme}>
                      <ThemedRoot />
                    </ThemeProvider>
                  </DismissedAnnouncementsProvider>
                </DisruptionsProvider>
              </JourneyProvider>
            </NearestLocationProvider>
          </FavouritesProvider>
        </DemoProvider>
      </UserProvider>
    </TweaksProvider>
  );
}

function ThemedRoot() {
  const colours = useTheme();
  const { theme } = useTweaks();
  return (
    <View style={{ flex: 1, backgroundColor: colours.bg }}>
      {/* Pastel orbs sit between the grouped grey canvas and the screen
          content. Cards (white) cover them where they sit; the bare
          margins between cards pick up the tint. */}
      <BackdropOrbs />
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          // Transparent so orbs are visible on tab screens. Modal /
          // pushed routes wrap in <Screen> which adds an opaque bg, so
          // they slide cleanly over without bleed-through.
          contentStyle: { backgroundColor: "transparent" },
        }}
      >
        {/* Announcements now pushes as a regular page (not a modal). The
            route is a top-level Stack.Screen so it can slide in from the
            right and own the full screen. */}
        <Stack.Screen name="announcements" />
      </Stack>
    </View>
  );
}
