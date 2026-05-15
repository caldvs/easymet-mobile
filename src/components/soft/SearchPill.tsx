import { useState } from "react";
import { Pressable, TextInput, View, type DimensionValue } from "react-native";
import { pressFeedback } from "./interaction";
import { SoftIcon } from "./SoftIcon";
import { soft } from "./tokens";

// Search input from image 4: white pill with placeholder text on the left
// and an inset-grey circular icon button on the right. Real `TextInput` —
// uncontrolled unless you pass `value`/`onChangeText`. Tap the icon to
// submit (fires `onSubmit` with the current query).
//
// `width` accepts a number for a fixed pill or "100%" to fill the parent
// container — the latter is what page-width search fields want.
export function SearchPill({
  placeholder = "Search",
  width = 220,
  value: controlledValue,
  onChangeText,
  onSubmit,
  autoFocus = false,
}: {
  placeholder?: string;
  width?: DimensionValue;
  value?: string;
  onChangeText?: (next: string) => void;
  onSubmit?: (query: string) => void;
  /** Focus the input on mount — useful for sheets that open into a search. */
  autoFocus?: boolean;
}) {
  const [internal, setInternal] = useState("");
  const value = controlledValue ?? internal;
  const setValue = (next: string) => {
    if (controlledValue == null) setInternal(next);
    onChangeText?.(next);
  };

  return (
    <View
      style={[
        {
          width,
          backgroundColor: soft.surface,
          borderRadius: soft.radii.pill,
          paddingLeft: 18,
          paddingRight: 6,
          paddingVertical: 6,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        soft.shadow.pill,
      ]}
    >
      <TextInput
        value={value}
        onChangeText={setValue}
        onSubmitEditing={() => onSubmit?.(value)}
        placeholder={placeholder}
        placeholderTextColor={soft.textFaint}
        returnKeyType="search"
        autoFocus={autoFocus}
        style={{
          flex: 1,
          fontFamily: soft.font.family,
          color: soft.text,
          fontSize: 15,
          fontWeight: "500",
          // Strip the default browser focus ring on web — the pill chassis
          // is already the visual focus affordance.
          outlineWidth: 0,
        } as object}
      />
      <Pressable
        onPress={() => onSubmit?.(value)}
        hitSlop={6}
        style={(state) => ({
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: soft.surfaceInset,
          alignItems: "center",
          justifyContent: "center",
          ...pressFeedback(state),
        })}
      >
        <SoftIcon name="search" size={16} color={soft.text} />
      </Pressable>
    </View>
  );
}
