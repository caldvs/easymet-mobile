import { Text, View } from "react-native";
import { useJourney } from "../lib/JourneyContext";
import { positionLineIds } from "../lib/journey";
import { corridorFor } from "../lib/lines";
import { stationByCode } from "../lib/stations";
import { useTheme } from "../lib/TweaksContext";
import { type } from "../lib/theme";

// Vertical ladder of stations along the journey route. Each rail segment
// is coloured by the line it uses; at transfer stations the rail changes
// colour and an inline "Change to X line" banner appears below the
// station name. Progress is driven by GPS (see JourneyContext) — rows
// are non-interactive.

// Maps a LINE_ORDERS key (e.g. "Ashton") to the canonical corridor name
// used by corridorFor() / the design palette.
function lineIdToCorridor(lineId: string): string {
  if (lineId === "Ashton") return "East Manchester";
  if (lineId === "East Didsbury") return "South Manchester";
  if (lineId === "Rochdale") return "Oldham & Rochdale";
  if (lineId === "MediaCityUK") return "Eccles"; // branch shares Eccles palette
  return lineId;
}

function lineIdToDisplay(lineId: string): string {
  if (lineId === "Ashton") return "Ashton";
  if (lineId === "East Didsbury") return "East Didsbury";
  if (lineId === "Rochdale") return "Rochdale";
  if (lineId === "MediaCityUK") return "MediaCityUK";
  return lineId;
}

export function JourneyLadder() {
  const colours = useTheme();
  const { journey, currentIdx } = useJourney();
  if (!journey) return null;

  const stations = journey.route.stations;
  const total = stations.length;
  // positionLines[i] = lineId used to travel stations[i] → stations[i+1].
  // Length is total - 1.
  const positionLines = positionLineIds(journey.route);

  return (
    <View>
      {stations.map((code, i) => {
        const station = stationByCode(code);
        if (!station) return null;
        const past = i < currentIdx;
        const current = i === currentIdx;
        const isFirst = i === 0;
        const isLast = i === total - 1;
        // Lines of the rail above / below this node.
        const incomingLine = i > 0 ? positionLines[i - 1] : null;
        const outgoingLine = i < total - 1 ? positionLines[i] : null;
        const isTransfer =
          incomingLine !== null &&
          outgoingLine !== null &&
          incomingLine !== outgoingLine;

        const topColour =
          incomingLine !== null ? corridorFor(lineIdToCorridor(incomingLine)).colour : null;
        const bottomColour =
          outgoingLine !== null ? corridorFor(lineIdToCorridor(outgoingLine)).colour : null;
        const nodeColour = bottomColour ?? topColour ?? colours.accent;

        return (
          <View
            key={code}
            style={{
              flexDirection: "row",
              alignItems: "stretch",
              minHeight: 56,
            }}
          >
            <RailCell
              past={past}
              current={current}
              isFirst={isFirst}
              isLast={isLast}
              topColour={topColour}
              bottomColour={bottomColour}
              nodeColour={nodeColour}
              isTransfer={isTransfer}
            />
            <View
              style={{
                flex: 1,
                paddingVertical: 14,
                paddingRight: 16,
                borderBottomWidth: isLast ? 0 : 0.5,
                borderBottomColor: colours.divider,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: current ? type.sansSemi : type.sansMedium,
                      fontWeight: current ? "600" : "500",
                      fontSize: current ? 17 : 15,
                      color: past ? colours.fgFaint : colours.fg,
                      textDecorationLine: past ? "line-through" : "none",
                      letterSpacing: -0.2,
                    }}
                  >
                    {station.name}
                  </Text>
                  {current && (
                    <Text
                      style={{
                        marginTop: 2,
                        fontFamily: type.sansSemi,
                        fontWeight: "600",
                        fontSize: 10,
                        letterSpacing: 1.2,
                        textTransform: "uppercase",
                        color: nodeColour,
                      }}
                    >
                      You are here
                    </Text>
                  )}
                </View>
                {isFirst && <TerminusPill label="Start" colour="#999" tint="rgba(0,0,0,0.06)" />}
                {isLast && bottomColour === null && (
                  <TerminusPill
                    label="Destination"
                    colour={topColour ?? nodeColour}
                    tint={`${topColour ?? nodeColour}1F`}
                  />
                )}
              </View>
              {isTransfer && (
                <View
                  style={{
                    marginTop: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    alignSelf: "flex-start",
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                    borderRadius: 999,
                    backgroundColor: `${bottomColour}26`,
                    borderWidth: 0.5,
                    borderColor: bottomColour ?? colours.divider,
                  }}
                >
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: bottomColour ?? nodeColour,
                    }}
                  />
                  <Text
                    style={{
                      fontFamily: type.sansSemi,
                      fontWeight: "600",
                      fontSize: 11,
                      letterSpacing: 0.4,
                      color: bottomColour ?? colours.fg,
                    }}
                  >
                    Change here · {lineIdToDisplay(outgoingLine!)} line
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function RailCell({
  past,
  current,
  isFirst,
  isLast,
  topColour,
  bottomColour,
  nodeColour,
  isTransfer,
}: {
  past: boolean;
  current: boolean;
  isFirst: boolean;
  isLast: boolean;
  topColour: string | null;
  bottomColour: string | null;
  nodeColour: string;
  isTransfer: boolean;
}) {
  const inactive = "rgba(0,0,0,0.12)";
  const topPaint = past || current ? topColour ?? inactive : inactive;
  const bottomPaint = past ? bottomColour ?? inactive : inactive;
  return (
    <View
      style={{
        width: 60,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {!isFirst && (
        <View
          style={{
            position: "absolute",
            top: 0,
            bottom: "50%",
            width: 4,
            borderRadius: 2,
            backgroundColor: topPaint,
          }}
        />
      )}
      {!isLast && (
        <View
          style={{
            position: "absolute",
            top: "50%",
            bottom: 0,
            width: 4,
            borderRadius: 2,
            backgroundColor: bottomPaint,
          }}
        />
      )}
      {/* Node */}
      {current ? (
        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: "#fff",
            borderWidth: 3,
            borderColor: nodeColour,
            shadowColor: nodeColour,
            shadowOpacity: 0.4,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 0 },
          }}
        />
      ) : isTransfer ? (
        // Hollow square-ish ring marks the change point — distinct from
        // ordinary nodes so a glance picks it out instantly.
        <View
          style={{
            width: 16,
            height: 16,
            borderRadius: 4,
            backgroundColor: "#fff",
            borderWidth: 2,
            borderColor: bottomColour ?? nodeColour,
            transform: [{ rotate: "45deg" }],
          }}
        />
      ) : past ? (
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: topColour ?? nodeColour,
          }}
        />
      ) : (
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: "transparent",
            borderWidth: 1.5,
            borderColor: "rgba(0,0,0,0.25)",
          }}
        />
      )}
    </View>
  );
}

function TerminusPill({ label, colour, tint }: { label: string; colour: string; tint: string }) {
  return (
    <View
      style={{
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 999,
        backgroundColor: tint,
        borderWidth: 0.5,
        borderColor: colour,
      }}
    >
      <Text
        style={{
          fontFamily: type.sansSemi,
          fontWeight: "600",
          fontSize: 10,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: colour,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
