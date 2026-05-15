import { useState, type ReactNode } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { useEffect, useRef } from "react";
import { minTouch, pressFeedback, useReduceMotion } from "./interaction";
import { SoftIcon } from "./SoftIcon";
import { soft } from "./tokens";

// Disclosure / expand-collapse panel. Header is the affordance; body
// height animates open. `multiple` allows several panels open at once;
// default behaviour is single-open (accordion-style).
//
// Used commonly for FAQs, settings groups, mobile "see more" cards.

type Item = { id: string; title: string; body: ReactNode };

export function Accordion({
  items,
  multiple = false,
  defaultExpanded,
}: {
  items: ReadonlyArray<Item>;
  multiple?: boolean;
  defaultExpanded?: string | ReadonlyArray<string>;
}) {
  const [open, setOpen] = useState<Set<string>>(() => {
    const init = Array.isArray(defaultExpanded)
      ? defaultExpanded
      : defaultExpanded
      ? [defaultExpanded]
      : [];
    return new Set(init);
  });

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!multiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  return (
    <View
      style={[
        {
          backgroundColor: soft.surface,
          borderRadius: soft.radii.card,
          overflow: "hidden",
          alignSelf: "stretch",
        },
        soft.shadow.pill,
      ]}
    >
      {items.map((item, i) => (
        <View key={item.id}>
          {i > 0 && <View style={{ height: 1, backgroundColor: soft.divider }} />}
          <AccordionItem item={item} expanded={open.has(item.id)} onToggle={() => toggle(item.id)} />
        </View>
      ))}
    </View>
  );
}

function AccordionItem({
  item,
  expanded,
  onToggle,
}: {
  item: Item;
  expanded: boolean;
  onToggle: () => void;
}) {
  const rot = useRef(new Animated.Value(expanded ? 1 : 0)).current;
  const reduceMotion = useReduceMotion();
  useEffect(() => {
    Animated.timing(rot, {
      toValue: expanded ? 1 : 0,
      duration: reduceMotion ? 0 : 180,
      useNativeDriver: true,
    }).start();
  }, [expanded, rot, reduceMotion]);

  return (
    <View>
      <Pressable
        onPress={onToggle}
        style={(state) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 14,
          paddingVertical: 14,
          minHeight: minTouch,
          ...pressFeedback(state),
        })}
      >
        <Text
          style={{
            flex: 1,
            fontFamily: soft.font.family,
            color: soft.text,
            fontSize: 15,
            fontWeight: "600",
            letterSpacing: -0.1,
          }}
        >
          {item.title}
        </Text>
        <Animated.View
          style={{
            transform: [
              {
                rotate: rot.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "180deg"],
                }),
              },
            ],
          }}
        >
          <SoftIcon name="chevronDown" size={16} color={soft.textMuted} strokeWidth={2} />
        </Animated.View>
      </Pressable>
      {expanded && (
        <View
          style={{
            paddingHorizontal: 14,
            paddingBottom: 14,
          }}
        >
          {typeof item.body === "string" ? (
            <Text
              style={{
                fontFamily: soft.font.family,
                color: soft.textMuted,
                fontSize: 14,
                fontWeight: "500",
                lineHeight: 22,
              }}
            >
              {item.body}
            </Text>
          ) : (
            item.body
          )}
        </View>
      )}
    </View>
  );
}
