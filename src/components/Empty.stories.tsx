import type { Meta, StoryObj } from "@storybook/react-vite";
import { Empty } from "./Empty";

const meta: Meta<typeof Empty> = {
  title: "Atoms/Empty",
  component: Empty,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const NoMatches: Story = {
  args: {
    title: 'No stations match "xyz"',
    hint: "Try another spelling, or clear the filter.",
  },
};

export const TitleOnly: Story = {
  args: { title: "No upcoming trams." },
};
