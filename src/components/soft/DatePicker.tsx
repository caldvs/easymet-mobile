import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { pressFeedback } from "./interaction";
import { SoftIcon } from "./SoftIcon";
import { soft, useSoftTheme } from "./tokens";

// Inline month-grid date picker. Tap arrows to flip months, tap a day to
// select. Single-date only (range-picker would compose two of these).
// Renders a 6-row × 7-col grid, fixed height to avoid jumping on month
// changes with 4-vs-6 row counts.

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function DatePicker({
  value: controlledValue,
  defaultValue,
  onChange,
}: {
  value?: Date;
  defaultValue?: Date;
  onChange?: (next: Date) => void;
}) {
  const [internal, setInternal] = useState<Date | undefined>(defaultValue);
  const value = controlledValue ?? internal;

  const [cursor, setCursor] = useState<Date>(value ?? new Date());

  const setValue = (next: Date) => {
    if (controlledValue == null) setInternal(next);
    onChange?.(next);
  };

  const monthStart = startOfMonth(cursor);
  const leadingBlanks = monthStart.getDay(); // 0 = Sunday
  const daysInMonth = new Date(
    cursor.getFullYear(),
    cursor.getMonth() + 1,
    0,
  ).getDate();

  // Build a 42-cell grid (6 rows × 7 cols).
  const cells: (Date | null)[] = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
  }
  while (cells.length < 42) cells.push(null);

  const today = new Date();

  return (
    <View
      style={[
        {
          backgroundColor: soft.surface,
          borderRadius: soft.radii.card,
          padding: 16,
          alignSelf: "flex-start",
        },
        soft.shadow.pill,
      ]}
    >
      {/* Month header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Pressable
          onPress={() =>
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
          }
          hitSlop={8}
          style={(s) => ({ padding: 6, ...pressFeedback(s) })}
        >
          <SoftIcon name="chevronLeft" size={16} color={soft.text} strokeWidth={2} />
        </Pressable>
        <Text
          style={{
            flex: 1,
            textAlign: "center",
            fontFamily: soft.font.family,
            color: soft.text,
            fontSize: 15,
            fontWeight: "700",
            letterSpacing: -0.1,
          }}
        >
          {MONTH_NAMES[cursor.getMonth()]} {cursor.getFullYear()}
        </Text>
        <Pressable
          onPress={() =>
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
          }
          hitSlop={8}
          style={(s) => ({ padding: 6, ...pressFeedback(s) })}
        >
          <SoftIcon name="chevronRight" size={16} color={soft.text} strokeWidth={2} />
        </Pressable>
      </View>

      {/* Day-of-week labels */}
      <View style={{ flexDirection: "row", marginBottom: 4 }}>
        {DAY_LABELS.map((d, i) => (
          <Text
            key={i}
            style={{
              flex: 1,
              textAlign: "center",
              fontFamily: soft.font.family,
              color: soft.textFaint,
              fontSize: 11,
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              paddingVertical: 4,
            }}
          >
            {d}
          </Text>
        ))}
      </View>

      {/* Grid */}
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {cells.map((d, i) => {
          if (!d) {
            return <View key={i} style={{ width: `${100 / 7}%`, height: 36 }} />;
          }
          const isSelected = value && sameDay(d, value);
          const isToday = sameDay(d, today);
          return (
            <Pressable
              key={i}
              onPress={() => setValue(d)}
              style={(s) => ({
                width: `${100 / 7}%`,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
                ...pressFeedback(s),
              })}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isSelected ? soft.accent : "transparent",
                  borderWidth: isToday && !isSelected ? 1.5 : 0,
                  borderColor: soft.accent,
                }}
              >
                <Text
                  style={{
                    fontFamily: soft.font.family,
                    color: isSelected ? "#FFFFFF" : soft.text,
                    fontSize: 14,
                    fontWeight: isSelected || isToday ? "700" : "500",
                  }}
                >
                  {d.getDate()}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
