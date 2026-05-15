import { useState } from "react";
import { Pressable, Text, TextInput, View, type TextInputProps } from "react-native";
import { pressFeedback } from "./interaction";
import { SoftIcon, type IconName } from "./SoftIcon";
import { soft } from "./tokens";

// Labeled text input with helper / error / leading-trailing slots. Built
// on the same white-pill surface as the rest of the kit. Pass `error` to
// flip the border red and surface the message; pass `secure` for password
// inputs (toggles the eye icon automatically).

export interface TextFieldProps
  extends Omit<TextInputProps, "style" | "placeholderTextColor" | "secureTextEntry"> {
  label?: string;
  helper?: string;
  error?: string;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  onTrailingPress?: () => void;
  secure?: boolean;
}

export function TextField({
  label,
  helper,
  error,
  leadingIcon,
  trailingIcon,
  onTrailingPress,
  secure = false,
  ...inputProps
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [reveal, setReveal] = useState(false);

  const showSecureToggle = secure;
  const actualTrailing = showSecureToggle
    ? ((reveal ? "eyeOff" : "eye") as IconName)
    : trailingIcon;
  const handleTrailing = showSecureToggle ? () => setReveal((v) => !v) : onTrailingPress;

  const borderColor = error ? soft.tone.danger.fg : focused ? soft.accent : "transparent";

  return (
    <View style={{ gap: 6, alignSelf: "stretch" }}>
      {label && (
        <Text
          style={{
            fontFamily: soft.font.family,
            color: soft.text,
            fontSize: 13,
            fontWeight: "600",
            letterSpacing: -0.1,
          }}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          {
            backgroundColor: soft.surface,
            borderRadius: soft.radii.input,
            paddingHorizontal: 14,
            paddingVertical: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            borderWidth: 1.5,
            borderColor,
            minHeight: 44,
          },
          soft.shadow.pill,
        ]}
      >
        {leadingIcon && <SoftIcon name={leadingIcon} size={16} color={soft.textMuted} />}
        <TextInput
          {...inputProps}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          secureTextEntry={secure && !reveal}
          placeholderTextColor={soft.textFaint}
          style={{
            flex: 1,
            fontFamily: soft.font.family,
            color: soft.text,
            fontSize: 15,
            fontWeight: "500",
            // Strip the default browser focus ring on web — the pill border
            // is the visual focus affordance.
            outlineWidth: 0,
          } as object}
        />
        {actualTrailing && (
          <Pressable
            onPress={handleTrailing}
            accessibilityRole={handleTrailing ? "button" : undefined}
            accessibilityLabel={
              showSecureToggle
                ? reveal
                  ? "Hide password"
                  : "Show password"
                : undefined
            }
            // 12pt hitSlop on a 16pt glyph → 40pt target. Combined with
            // the parent row's 44pt min-height the trailing affordance
            // is now thumb-safe.
            hitSlop={12}
            disabled={!handleTrailing}
            style={(state) => ({
              padding: 2,
              ...(handleTrailing ? pressFeedback(state) : null),
            })}
          >
            <SoftIcon name={actualTrailing} size={16} color={soft.textMuted} />
          </Pressable>
        )}
      </View>
      {(error || helper) && (
        <Text
          style={{
            fontFamily: soft.font.family,
            color: error ? soft.tone.danger.fg : soft.textMuted,
            fontSize: 12,
            fontWeight: "500",
          }}
        >
          {error ?? helper}
        </Text>
      )}
    </View>
  );
}
