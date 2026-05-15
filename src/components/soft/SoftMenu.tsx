import { useState } from "react";
import { Pressable, Text, View, type ViewStyle } from "react-native";
import { pressFeedback } from "./interaction";
import { SoftIcon } from "./SoftIcon";
import { soft } from "./tokens";

// A small floating menu used by ToolbarDropdown and similar atoms. It's a
// soft-shadowed white card with a list of rows; the active row gets a tick
// and a tonal background. Anchored below the trigger via absolute
// positioning, sized to its content.

export type MenuOption<T> = { value: T; label: string };

export function SoftMenu<T>({
  options,
  value,
  onSelect,
  anchorWidth,
  align = "left",
}: {
  options: ReadonlyArray<MenuOption<T>>;
  value?: T;
  onSelect: (next: T) => void;
  /** Optional minimum width — usually the trigger's width. */
  anchorWidth?: number;
  align?: "left" | "right";
}) {
  const containerStyle: ViewStyle = {
    position: "absolute",
    top: "100%",
    marginTop: 6,
    [align]: 0,
    minWidth: anchorWidth,
    backgroundColor: soft.surface,
    borderRadius: soft.radii.card,
    paddingVertical: 6,
    ...soft.shadow.chassis,
    // Make sure the menu floats above sibling chrome.
    zIndex: 1000,
  };

  return (
    <View style={containerStyle}>
      {options.map((opt, i) => {
        const active = value !== undefined && opt.value === value;
        return (
          <Pressable
            key={i}
            onPress={() => onSelect(opt.value)}
            style={(state) => ({
              paddingHorizontal: 12,
              paddingVertical: 8,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: active ? soft.accentSoft : "transparent",
              ...pressFeedback(state),
            })}
          >
            <Text
              style={{
                fontFamily: soft.font.family,
                fontSize: 14,
                color: active ? soft.accent : soft.text,
                fontWeight: active ? "600" : "500",
                flex: 1,
              }}
            >
              {opt.label}
            </Text>
            {active && <SoftIcon name="check" size={14} color={soft.accent} strokeWidth={2.25} />}
          </Pressable>
        );
      })}
    </View>
  );
}

// Helper hook: track open/close + a value selection. Use it when you want
// to wire a trigger+menu without forwarding handlers manually.
export function useMenuState<T>(initial?: T) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<T | undefined>(initial);
  return {
    open,
    selected,
    toggle: () => setOpen((v) => !v),
    close: () => setOpen(false),
    select: (next: T) => {
      setSelected(next);
      setOpen(false);
    },
  };
}
