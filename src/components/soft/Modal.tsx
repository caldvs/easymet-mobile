import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Modal as RNModal,
  Pressable,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { minTouch, pressFeedback } from "./interaction";
import { SoftIcon } from "./SoftIcon";
import { soft } from "./tokens";

// Soft-UI overlay. Two presentations:
//   * `position="center"` — classic dialog, fades in.
//   * `position="bottom"` — mobile bottom sheet, slides up.
// Tap the dim backdrop or the ✕ to dismiss.

export function SoftModal({
  visible,
  onClose,
  position = "center",
  title,
  children,
  maxWidth = 480,
  dismissable = true,
}: {
  visible: boolean;
  onClose: () => void;
  position?: "center" | "bottom";
  title?: string;
  children?: React.ReactNode;
  maxWidth?: number;
  dismissable?: boolean;
}) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: visible ? 1 : 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: visible ? 0 : 40,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, fade, slide]);

  const sheetLayout: ViewStyle =
    position === "center"
      ? {
          maxWidth,
          width: "92%",
          backgroundColor: soft.surface,
          borderRadius: soft.radii.card,
          padding: 20,
          ...soft.shadow.chassis,
        }
      : {
          width: "100%",
          maxWidth,
          alignSelf: "center",
          backgroundColor: soft.surface,
          borderTopLeftRadius: soft.radii.card * 2,
          borderTopRightRadius: soft.radii.card * 2,
          padding: 20,
          paddingBottom: 32,
          ...soft.shadow.chassis,
        };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "rgba(20,20,30,0.32)",
          opacity: fade,
          justifyContent: position === "center" ? "center" : "flex-end",
          alignItems: "center",
        }}
      >
        <Pressable
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={dismissable ? onClose : undefined}
        />
        <Animated.View
          style={{
            transform: [{ translateY: slide }],
            ...sheetLayout,
          }}
        >
          {position === "bottom" && (
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: soft.divider,
                alignSelf: "center",
                marginBottom: 16,
              }}
            />
          )}
          {(title || dismissable) && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              {title && (
                <Text
                  style={{
                    flex: 1,
                    fontFamily: soft.font.family,
                    color: soft.text,
                    fontSize: 18,
                    fontWeight: "700",
                    letterSpacing: -0.2,
                  }}
                >
                  {title}
                </Text>
              )}
              {dismissable && (
                <Pressable
                  onPress={onClose}
                  hitSlop={8}
                  style={(state) => ({
                    width: minTouch,
                    height: minTouch,
                    alignItems: "center",
                    justifyContent: "center",
                    ...pressFeedback(state),
                  })}
                >
                  <SoftIcon name="close" size={18} color={soft.textMuted} />
                </Pressable>
              )}
            </View>
          )}
          {children}
        </Animated.View>
      </Animated.View>
    </RNModal>
  );
}
