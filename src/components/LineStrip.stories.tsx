import type { Meta, StoryObj } from "@storybook/react-vite";
import { LineStrip } from "./LineStrip";

const meta: Meta<typeof LineStrip> = {
  title: "Atoms/LineStrip",
  component: LineStrip,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleLine: Story = {
  args: { lines: ["Bury"], size: 8 },
};

export const TwoLines: Story = {
  args: { lines: ["Altrincham", "Bury"], size: 8 },
};

export const StPetersSquare: Story = {
  name: "St Peter's Square (all 8 lines)",
  args: {
    lines: [
      "Altrincham",
      "Bury",
      "Eccles",
      "Airport",
      "East Didsbury",
      "Rochdale",
      "Ashton",
      "Trafford Park",
    ],
    size: 8,
  },
};

export const Large: Story = {
  args: { lines: ["Airport", "Trafford Park"], size: 14, gap: 6 },
};
