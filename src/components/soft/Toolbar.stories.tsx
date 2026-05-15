import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Text, View } from "react-native";
import { GradientButton, Sparkles } from "./GradientButton";
import { IconToggle } from "./IconToggle";
import { SoftIcon } from "./SoftIcon";
import {
  AlignSegmented,
  ColourSwatch,
  Toolbar,
  ToolbarDropdown,
  ToolbarGroup,
  type AlignValue,
} from "./Toolbar";
import { Tooltip } from "./Tooltip";
import { soft } from "./tokens";

const Bold = <SoftIcon name="boldB" size={18} color={soft.text} />;
const Italic = <SoftIcon name="italicI" size={18} color={soft.text} />;
const Underline = <SoftIcon name="underlineU" size={18} color={soft.text} />;

const FONT_OPTIONS = [
  { value: "Inter", label: "Inter" },
  { value: "DM Sans", label: "DM Sans" },
  { value: "JetBrains Mono", label: "JetBrains Mono" },
  { value: "SF Pro", label: "SF Pro" },
];
const SIZE_OPTIONS = [10, 12, 14, 16, 18, 24, 32].map((n) => ({
  value: n,
  label: `${n}px`,
}));
const SPACING_OPTIONS = [0, 2, 4, 8, 12, 16].map((n) => ({
  value: n,
  label: `${n}px`,
}));

const meta: Meta = {
  title: "Soft UI/Toolbar",
  parameters: { softKit: true },
  decorators: [
    (Story) => (
      <View style={{ padding: 48, backgroundColor: soft.canvas, minWidth: 1100 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Hook that bundles every piece of toolbar state — used by both
// FormattingBar and InContext so the demos stay in sync.
function useToolbarState() {
  const [marks, setMarks] = useState({ b: true, i: false, u: false });
  const toggle = (k: keyof typeof marks) =>
    setMarks((m) => ({ ...m, [k]: !m[k] }));
  const [align, setAlign] = useState<AlignValue>("left");
  const [font, setFont] = useState("Inter");
  const [size, setSize] = useState(14);
  const [spacing, setSpacing] = useState(4);
  return { marks, toggle, align, setAlign, font, setFont, size, setSize, spacing, setSpacing };
}

// Recreates image 1's two toolbar layouts. Every control is wired up:
// click B/I/U to toggle the active style, click alignment to switch, open
// the dropdowns to pick a font / size / spacing.
export const FormattingBar: Story = {
  render: () => {
    const t = useToolbarState();
    return (
      <View style={{ alignItems: "flex-start", gap: 12 }}>
        <View style={{ paddingLeft: 110 }}>
          <Tooltip>Bold: ⌘ + B</Tooltip>
        </View>
        <Toolbar>
          <ToolbarDropdown
            label={`${t.spacing}px`}
            value={t.spacing}
            onChange={t.setSpacing}
            options={SPACING_OPTIONS}
          />
          <ToolbarGroup>
            <IconToggle glyph={Bold} selected={t.marks.b} onPress={() => t.toggle("b")} />
            <IconToggle glyph={Italic} selected={t.marks.i} onPress={() => t.toggle("i")} />
            <IconToggle glyph={Underline} selected={t.marks.u} onPress={() => t.toggle("u")} />
          </ToolbarGroup>
          <AlignSegmented value={t.align} onChange={t.setAlign} />
        </Toolbar>

        <View style={{ height: 32 }} />

        <Toolbar>
          <GradientButton
            label="Ask AI"
            leading={<Sparkles />}
            gradient="askAI"
            size="sm"
          />
          <ToolbarDropdown
            label={t.font}
            hint="Regular"
            value={t.font}
            onChange={t.setFont}
            options={FONT_OPTIONS}
          />
          <ToolbarDropdown
            label={`${t.size}px`}
            value={t.size}
            onChange={t.setSize}
            options={SIZE_OPTIONS}
          />
          <ColourSwatch />
        </Toolbar>
      </View>
    );
  },
};

// Recreates image 3 — the full toolbar above the Kree8 paragraph. The
// paragraph itself reacts to font / size / alignment / spacing pressed in
// the toolbar so the "what does this control do?" loop is visible.
export const InContext: Story = {
  render: () => {
    const t = useToolbarState();
    return (
      <View style={{ gap: 24, maxWidth: 1100, alignSelf: "center" }}>
        <View style={{ alignItems: "center", gap: 10 }}>
          <View style={{ marginLeft: 200 }}>
            <Tooltip>Bold: ⌘ + B</Tooltip>
          </View>
          <Toolbar>
            <GradientButton
              label="Ask AI"
              leading={<Sparkles />}
              gradient="askAI"
              size="sm"
            />
            <ToolbarDropdown
              label={t.font}
              hint="Regular"
              value={t.font}
              onChange={t.setFont}
              options={FONT_OPTIONS}
            />
            <ToolbarDropdown
              label={`${t.size}px`}
              value={t.size}
              onChange={t.setSize}
              options={SIZE_OPTIONS}
            />
            <ColourSwatch />
            <ToolbarGroup>
              <IconToggle glyph={Bold} selected={t.marks.b} onPress={() => t.toggle("b")} />
              <IconToggle glyph={Italic} selected={t.marks.i} onPress={() => t.toggle("i")} />
              <IconToggle glyph={Underline} selected={t.marks.u} onPress={() => t.toggle("u")} />
            </ToolbarGroup>
            <AlignSegmented value={t.align} onChange={t.setAlign} />
          </Toolbar>
        </View>

        <Text
          style={{
            fontSize: t.size + 8,
            lineHeight: (t.size + 8) * 1.6,
            color: soft.text,
            maxWidth: 880,
            alignSelf: "center",
            textAlign: t.align,
            fontWeight: t.marks.b ? "700" : "400",
            fontStyle: t.marks.i ? "italic" : "normal",
            textDecorationLine: t.marks.u ? "underline" : "none",
          }}
        >
          Kree8 is led by a{" "}
          <Text style={{ backgroundColor: soft.accentSoft, color: soft.text }}>
            passionate team Satya,
          </Text>
          {" "}a brand strategist and creative mind, and Jay, a talented designer
          and developer. Together, we built Kree8 to deliver innovative design
          solutions tailored to each client's unique needs.{" "}
          <Text style={{ color: soft.textFaint }}>
            Our vision is to help brands unlock their full potential through
            strategic, impactful, and visually stunning designs, while fostering
            long-lasting relationships built on trust and creativity.
          </Text>
        </Text>
      </View>
    );
  },
};
