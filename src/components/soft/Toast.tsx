import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { pressFeedback } from "./interaction";
import { SoftIcon, type IconName } from "./SoftIcon";
import { soft, type Tone } from "./tokens";

// Transient notification. Slides up from the bottom (or top — configurable
// per-call). Auto-dismisses after `duration` ms; tap to dismiss early.
// Use the `ToastProvider` at app root, then call `useToast().show({...})`
// from anywhere in the tree.

type ToastInput = {
  title: string;
  description?: string;
  tone?: Tone;
  icon?: IconName;
  duration?: number;
};
type ToastInstance = ToastInput & { id: number };

const DEFAULT_ICON: Record<Tone, IconName> = {
  neutral: "info",
  accent: "info",
  success: "check",
  warning: "warning",
  danger: "errorOctagon",
};

const Ctx = createContext<{ show: (t: ToastInput) => void } | null>(null);

export function ToastProvider({
  children,
  placement = "bottom",
}: {
  children: React.ReactNode;
  placement?: "top" | "bottom";
}) {
  const [toasts, setToasts] = useState<ToastInstance[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((xs) => xs.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (t: ToastInput) => {
      const id = ++idRef.current;
      setToasts((xs) => [...xs, { ...t, id }]);
      const dur = t.duration ?? 3500;
      setTimeout(() => dismiss(id), dur);
    },
    [dismiss],
  );

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          [placement]: 24,
          alignItems: "center",
          gap: 8,
        }}
      >
        {toasts.map((t) => (
          <ToastView key={t.id} toast={t} onDismiss={() => dismiss(t.id)} placement={placement} />
        ))}
      </View>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return ctx;
}

function ToastView({
  toast,
  onDismiss,
  placement,
}: {
  toast: ToastInstance;
  onDismiss: () => void;
  placement: "top" | "bottom";
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim]);

  const palette = soft.tone[toast.tone ?? "neutral"];
  const iconName = toast.icon ?? DEFAULT_ICON[toast.tone ?? "neutral"];
  const offset = placement === "top" ? -16 : 16;

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [offset, 0] }) }],
      }}
    >
      <Pressable
        onPress={onDismiss}
        style={(state) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          backgroundColor: soft.surface,
          borderRadius: soft.radii.card,
          maxWidth: 420,
          ...soft.shadow.chassis,
          ...pressFeedback(state),
        })}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            backgroundColor: palette.tint,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SoftIcon name={iconName} size={16} color={palette.fg} strokeWidth={2} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: soft.font.family,
              color: soft.text,
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            {toast.title}
          </Text>
          {toast.description && (
            <Text
              style={{
                fontFamily: soft.font.family,
                color: soft.textMuted,
                fontSize: 13,
                fontWeight: "500",
                marginTop: 2,
              }}
            >
              {toast.description}
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}
