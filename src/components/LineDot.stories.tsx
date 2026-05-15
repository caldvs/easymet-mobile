import type { Meta, StoryObj } from "@storybook/react-vite";
import { View } from "react-native";
import { LineDot } from "./LineDot";
import { CORRIDORS } from "../lib/lines";

const meta: Meta<typeof LineDot> = {
  title: "Atoms/LineDot",
  component: LineDot,
  argTypes: {
    corridor: {
      control: { type: "select" },
      options: Object.keys(CORRIDORS),
    },
    size: { control: { type: "number", min: 4, max: 20 } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AllCorridors: Story = {
  render: () => (
    <View style={{ flexDirection: "row", gap: 8 }}>
      {Object.keys(CORRIDORS).map((c) => (
        <LineDot key={c} corridor={c} size={12} />
      ))}
    </View>
  ),
};

export const Single: Story = {
  args: { corridor: "Bury", size: 10 },
};
