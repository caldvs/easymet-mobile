import { useMemo, useState } from "react";
import { Keyboard, Pressable, ScrollView, Text, View } from "react-native";
import { useTheme } from "../lib/TweaksContext";
import { allStations, type Station } from "../lib/stations";
import { type } from "../lib/theme";
import { pressFeedback } from "./soft/interaction";
import { SearchPill } from "./soft/SearchPill";
import { SoftIcon } from "./soft/SoftIcon";
import { SoftModal } from "./soft/Modal";
import { LineStrip } from "./LineStrip";

// Bottom sheet for picking a station — opens from Plan when the user
// wants to search by name. Has its own focused search UI rather than
// filtering an in-page list, so the "All stations" surface on Plan
// stays as a stable browsing list (a separate intent from text search).
//
// Chassis is now the kit's `SoftModal position="bottom"`. The animated
// translateY, dim, drag-handle, and close-X are all handled there — this
// file is just the content (search field + filtered list).
export function StationPickerSheet({
  visible,
  title,
  onClose,
  onPick,
  excludeCodes = [],
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  onPick: (s: Station) => void;
  excludeCodes?: string[];
}) {
  const colours = useTheme();
  const [query, setQuery] = useState("");

  const suggestions = useMemo(() => {
    const exclude = new Set(excludeCodes);
    const all = allStations().filter((s) => !exclude.has(s.code));
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((s) => s.name.toLowerCase().includes(q));
  }, [query, excludeCodes]);

  return (
    <SoftModal
      visible={visible}
      onClose={() => {
        setQuery("");
        onClose();
      }}
      position="bottom"
      title={title}
    >
      <SearchPill
        placeholder="Search stations"
        width="100%"
        value={query}
        onChangeText={setQuery}
        autoFocus
      />

      <ScrollView
        style={{ flexGrow: 0, marginTop: 12, maxHeight: 480 }}
        keyboardShouldPersistTaps="handled"
      >
        {suggestions.length === 0 ? (
          <View style={{ padding: 24 }}>
            <Text
              style={{
                fontFamily: type.sans,
                fontSize: 14,
                color: colours.fgMuted,
                textAlign: "center",
              }}
            >
              No stations match &ldquo;{query}&rdquo;.
            </Text>
          </View>
        ) : (
          suggestions.map((s, i) => (
            <View key={s.code}>
              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  onPick(s);
                  setQuery("");
                }}
                style={(state) => ({
                  minHeight: 48,
                  paddingHorizontal: 4,
                  paddingVertical: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  ...pressFeedback(state),
                })}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontFamily: type.sansMedium, fontWeight: "500", fontSize: 16, color: colours.fg }}
                    numberOfLines={1}
                  >
                    {s.name}
                  </Text>
                  <View
                    style={{
                      marginTop: 3,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <LineStrip lines={s.lines} size={7} gap={3} />
                    {s.zone != null && (
                      <Text
                        style={{ fontFamily: type.sans, fontSize: 12, color: colours.fgMuted }}
                      >
                        Zone {s.zone}
                      </Text>
                    )}
                  </View>
                </View>
                <SoftIcon name="chevronRight" size={16} color={colours.fgFaint} strokeWidth={2} />
              </Pressable>
              {i < suggestions.length - 1 && (
                <View
                  style={{
                    marginLeft: 4,
                    height: 1,
                    backgroundColor: colours.divider,
                  }}
                />
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SoftModal>
  );
}
