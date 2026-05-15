import { Pressable, Text, View } from "react-native";
import { minTouch, pressFeedback } from "./interaction";
import { soft } from "./tokens";

// Single radio option. Composed by `RadioGroup` which handles state +
// keyboard semantics. Selecting one option in the group deselects the rest.

export function RadioOption<T>({
  value,
  selected,
  label,
  disabled,
  onPress,
}: {
  value: T;
  selected: boolean;
  label: string;
  disabled?: boolean;
  onPress: (v: T) => void;
}) {
  return (
    <Pressable
      onPress={() => !disabled && onPress(value)}
      disabled={disabled}
      style={(state) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        minHeight: minTouch,
        opacity: disabled ? 0.4 : 1,
        ...pressFeedback(state),
      })}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          borderWidth: 1.5,
          borderColor: selected ? soft.accent : soft.divider,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected && (
          <View
            style={{
              width: 11,
              height: 11,
              borderRadius: 6,
              backgroundColor: soft.accent,
            }}
          />
        )}
      </View>
      <Text
        style={{
          fontFamily: soft.font.family,
          color: soft.text,
          fontSize: 15,
          fontWeight: "500",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function RadioGroup<T>({
  options,
  value,
  onChange,
  direction = "column",
}: {
  options: ReadonlyArray<{ value: T; label: string; disabled?: boolean }>;
  value: T;
  onChange?: (next: T) => void;
  direction?: "row" | "column";
}) {
  return (
    <View
      style={{
        flexDirection: direction,
        gap: direction === "row" ? 20 : 4,
      }}
    >
      {options.map((opt, i) => (
        <RadioOption
          key={i}
          value={opt.value}
          label={opt.label}
          selected={opt.value === value}
          disabled={opt.disabled}
          onPress={(v) => onChange?.(v)}
        />
      ))}
    </View>
  );
}
