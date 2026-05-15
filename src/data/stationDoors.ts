// Curated door-side data for Manchester Metrolink stations.
//
// The Live Activity's alight statement renders "Doors right at <Station>" or
// "Doors left at <Station>" depending on the resolved side.
//
// Convention
// ----------
// The DEFAULT door side is "left" — true for the majority of Metrolink stops.
// We then override individual stations that are known to be "right" or
// "both" (island platforms). As we observe stations on the ground, append
// to the override maps below.
//
// Resolution keys
// ---------------
//   corridor       — canonical corridor name (e.g. "Bury", "Altrincham",
//                    "East Manchester") — what `corridorFromLineId` in
//                    JourneyContext.tsx returns.
//   terminusName   — station name of the terminus the tram is heading
//                    toward (the last station of the route segment).
//   stationName    — station name where the user will alight.

export type DoorSide = "left" | "right" | "both";

type DirectionTable = Record<string, DoorSide>; // stationName -> side
type LineTable = Record<string, DirectionTable>; // terminusName -> direction table
type DoorsTable = Record<string, LineTable>; // canonical corridor -> line table

// Stations where doors open on the RIGHT (against the default). Add
// entries as they are confirmed.
const RIGHT_OVERRIDES: DoorsTable = {
  // Example shape — replace with confirmed observations.
  // Bury: {
  //   "Piccadilly": { "Victoria": "right" },
  // },
};

// Stations with island platforms where doors open on BOTH sides. The
// alight copy falls back to "Alight at" for these because the cue isn't
// actionable.
const BOTH_OVERRIDES: DoorsTable = {
  // e.g. Cornbrook, St Peter's Square (to verify on the ground).
};

const DEFAULT_SIDE: DoorSide = "left";

export function doorSideFor(
  corridor: string,
  towardTerminusName: string,
  alightStationName: string,
): DoorSide {
  return (
    BOTH_OVERRIDES[corridor]?.[towardTerminusName]?.[alightStationName] ??
    RIGHT_OVERRIDES[corridor]?.[towardTerminusName]?.[alightStationName] ??
    DEFAULT_SIDE
  );
}
