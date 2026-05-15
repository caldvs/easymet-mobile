import { Children, Fragment, useState, type ReactNode } from "react";
import { Pressable, Text, View, type ViewStyle } from "react-native";
import { IconToggle } from "./IconToggle";
import { pressFeedback } from "./interaction";
import { SoftMenu, type MenuOption } from "./SoftMenu";
import { SoftIcon, type IconName } from "./SoftIcon";
import { soft, useSoftTheme } from "./tokens";

// The toolbar chassis from images 1 + 3: a wide soft-shadowed pill that
// arranges its children into sections separated by short vertical dividers.
// Each "section" is a child wrapped in a View — the toolbar inserts the
// divider between siblings automatically.
export function Toolbar({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  const kids = Children.toArray(children).filter(Boolean);
  return (
    <View
      style={[
        {
          alignSelf: "flex-start",
          backgroundColor: soft.surface,
          borderRadius: soft.radii.pill,
          paddingHorizontal: 8,
          paddingVertical: 6,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
        },
        soft.shadow.chassis,
        style,
      ]}
    >
      {kids.map((c, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <View
              style={{
                width: 1,
                height: 22,
                backgroundColor: soft.divider,
                marginHorizontal: 4,
              }}
            />
          )}
          {c}
        </Fragment>
      ))}
    </View>
  );
}

// Helper: wraps an inline group of children so they sit together as one
// "section" inside the toolbar (so the auto-divider doesn't separate
// e.g. B / I / U from each other).
export function ToolbarGroup({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <View style={[{ flexDirection: "row", alignItems: "center", gap: 2 }, style]}>
      {children}
    </View>
  );
}

// The "Inter · Regular ⌄" / "14px ⌄" dropdown pill that lives inside the
// toolbar. Inset grey surface, caret on the right. When `options` is
// supplied the pill becomes a real dropdown — click it to open a menu and
// pick a value; the label and `value` update accordingly.
export function ToolbarDropdown<T extends string | number>({
  label,
  hint,
  width,
  options,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  width?: number;
  options?: ReadonlyArray<MenuOption<T>>;
  value?: T;
  onChange?: (next: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const isInteractive = !!options;

  const display = (
    <>
      <Text
        style={{
          fontFamily: soft.font.family,
          color: soft.text,
          fontSize: 14,
          fontWeight: "600",
          letterSpacing: -0.1,
        }}
      >
        {label}
      </Text>
      {hint && (
        <Text
          style={{
            fontFamily: soft.font.family,
            color: soft.textMuted,
            fontSize: 14,
            fontWeight: "500",
          }}
        >
          · {hint}
        </Text>
      )}
      <View style={{ marginLeft: 2 }}>
        <SoftIcon name="chevronDown" size={12} color={soft.textMuted} strokeWidth={2} />
      </View>
    </>
  );

  const layout: ViewStyle = {
    width,
    backgroundColor: soft.surfaceInset,
    borderRadius: soft.radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  };

  if (!isInteractive) {
    return <View style={layout}>{display}</View>;
  }

  return (
    <View style={{ position: "relative" }}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={(state) => ({ ...layout, ...pressFeedback(state) })}
      >
        {display}
      </Pressable>
      {open && options && (
        <SoftMenu<T>
          options={options}
          value={value}
          onSelect={(v) => {
            setOpen(false);
            onChange?.(v);
          }}
        />
      )}
    </View>
  );
}

// The three text-alignment glyphs from image 1, packaged as a single
// segmented control. Reusing IconToggle for the raised selected state.
export type AlignValue = "left" | "center" | "right";
export function AlignSegmented({
  value,
  onChange,
}: {
  value: AlignValue;
  onChange?: (v: AlignValue) => void;
}) {
  const opts: { v: AlignValue; icon: IconName }[] = [
    { v: "left", icon: "alignLeft" },
    { v: "center", icon: "alignCenter" },
    { v: "right", icon: "alignRight" },
  ];
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 0 }}>
      {opts.map((o) => (
        <IconToggle
          key={o.v}
          glyph={
            <SoftIcon
              name={o.icon}
              size={18}
              color={o.v === value ? soft.text : soft.textMuted}
            />
          }
          selected={value === o.v}
          onPress={() => onChange?.(o.v)}
        />
      ))}
    </View>
  );
}

// The blue colour swatch from image 1 — small floating circle in the
// toolbar's chrome.
export function ColourSwatch({
  color = soft.accent,
  size = 22,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        ...soft.shadow.pill,
      }}
    />
  );
}
