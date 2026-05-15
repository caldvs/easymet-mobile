// Standalone story for the floating iOS 26 "Liquid Glass" tab bar.
// Lets us inspect each tab's active state without booting a whole screen.

import type { Meta, StoryObj } from "@storybook/react-vite";
import { View } from "react-native";
import { TabBar } from "./TabBar";

const meta: Meta<typeof TabBar> = {
  title: "App chrome/Floating tab bar",
  component: TabBar,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story, ctx) => {
      // The TabBar reads `usePathname()` from expo-router; in Storybook
      // that's stubbed to read `globalThis.__SB_PATHNAME__`. Each story
      // sets it via its parameters so the active tab matches the title.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).__SB_PATHNAME__ = ctx.parameters?.pathname ?? "/";
      return (
        <View
          style={{
            width: 402,
            height: 200,
            backgroundColor: "#EEF1FA",
            justifyContent: "flex-end",
          }}
        >
          <Story />
        </View>
      );
    },
  ],
};
export default meta;
type Story = StoryObj<typeof TabBar>;

export const HomeActive: Story = {
  name: "Home active",
  parameters: { pathname: "/" },
};

export const NearbyActive: Story = {
  name: "Nearby active",
  parameters: { pathname: "/nearby" },
};

export const PlanActive: Story = {
  name: "Plan active",
  parameters: { pathname: "/plan" },
};

export const BrowseActive: Story = {
  name: "Browse active",
  parameters: { pathname: "/browse" },
};
