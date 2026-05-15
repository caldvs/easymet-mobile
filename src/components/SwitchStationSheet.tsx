import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { allStations } from "../lib/stations";
import { useTheme } from "../lib/TweaksContext";
import { type } from "../lib/theme";
import { pressFeedback } from "./soft/interaction";
import { SearchPill } from "./soft/SearchPill";
import { SoftModal } from "./soft/Modal";
import { LineStrip } from "./LineStrip";

// "Switch station" sheet — opens from Station detail to jump to another
// stop without leaving the screen flow. Chassis is the soft kit's
// `SoftModal position="bottom"`.
export function SwitchStationSheet({
  visible,
  currentCode,
  onSelect,
  onClose,
}: {
  visible: boolean;
  currentCode: string;
  onSelect: (code: string) => void;
  onClose: () => void;
}) {
  const colours = useTheme();
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const all = allStations();
    if (!q.trim()) return all.slice(0, 8);
    const k = q.trim().toLowerCase();
    return all.filter((s) => s.name.toLowerCase().includes(k)).slice(0, 30);
  }, [q]);

  return (
    <SoftModal
      visible={visible}
      onClose={() => {
        setQ("");
        onClose();
      }}
      position="bottom"
      title="Choose a station"
    >
      <SearchPill
        placeholder="Search stations"
        width="100%"
        value={q}
        onChangeText={setQ}
        autoFocus
      />

      <ScrollView
        style={{ flexGrow: 0, marginTop: 12, maxHeight: 440 }}
        keyboardShouldPersistTaps="handled"
      >
        {!q && (
          <Text
            style={{
              paddingTop: 4,
              paddingBottom: 4,
              fontFamily: type.sansSemi,
              fontWeight: "600",
              fontSize: 11,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: colours.fgSubtle,
            }}
          >
            Suggested
          </Text>
        )}
        {results.map((s) => {
          const isCurrent = s.code === currentCode;
          return (
            <Pressable
              key={s.code}
              onPress={() => {
                onSelect(s.code);
                onClose();
              }}
              style={(state) => ({
                paddingVertical: 12,
                paddingHorizontal: 4,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                ...pressFeedback(state),
              })}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: type.sansMedium,
                    fontWeight: "500",
                    fontSize: 16,
                    color: colours.fg,
                    letterSpacing: -0.2,
                  }}
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
                      style={{
                        fontFamily: type.sans,
                        fontSize: 12,
                        color: colours.fgMuted,
                      }}
                    >
                      Zone {s.zone}
                    </Text>
                  )}
                </View>
              </View>
              {isCurrent && (
                <Text
                  style={{
                    fontFamily: type.sansSemi,
                    fontWeight: "600",
                    fontSize: 12,
                    color: colours.accent,
                  }}
                >
                  Current
                </Text>
              )}
            </Pressable>
          );
        })}
        <View style={{ height: 12 }} />
      </ScrollView>
    </SoftModal>
  );
}
