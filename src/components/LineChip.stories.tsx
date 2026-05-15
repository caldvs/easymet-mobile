import type { Meta, StoryObj } from "@storybook/react-vite";
import { View } from "react-native";
import { LineChip } from "./LineChip";

const meta: Meta<typeof LineChip> = {
  title: "Atoms/LineChip",
  component: LineChip,
  argTypes: {
    line: {
      control: { type: "select" },
      options: [
        "Airport",
        "Altrincham",
        "Ashton",
        "Bury",
        "East Didsbury",
        "Eccles",
        "Rochdale",
        "Trafford Park",
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = { args: { line: "Bury" } };

export const AllLines: Story = {
  render: () => (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, maxWidth: 360 }}>
      {[
        "Airport",
        "Altrincham",
        "Ashton",
        "Bury",
        "East Didsbury",
        "Eccles",
        "Rochdale",
        "Trafford Park",
      ].map((l) => (
        <LineChip key={l} line={l} />
      ))}
    </View>
  ),
};
