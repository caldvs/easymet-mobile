// Maps TfGM's `Line` field (infrastructure corridor) to a display name +
// colour from the design palette. TfGM uses 8 corridor names; the design
// uses 8 service-pattern names — they have a near-1:1 mapping with
// slightly different labels.

export type CorridorName =
  | "Airport"
  | "Altrincham"
  | "Bury"
  | "East Manchester"
  | "Eccles"
  | "Oldham & Rochdale"
  | "South Manchester"
  | "Trafford Park";

export interface Corridor {
  displayName: string;
  colour: string;
}

export const CORRIDORS: Record<CorridorName, Corridor> = {
  "Airport":            { displayName: "Airport",        colour: "#22A06B" },
  "Altrincham":         { displayName: "Altrincham",     colour: "#3FA9B5" },
  "Bury":               { displayName: "Bury",           colour: "#F2C14E" },
  "East Manchester":    { displayName: "Ashton",         colour: "#60BAEF" },
  "Eccles":             { displayName: "Eccles",         colour: "#3B82F6" },
  "Oldham & Rochdale":  { displayName: "Rochdale",       colour: "#C8102E" },
  "South Manchester":   { displayName: "East Didsbury",  colour: "#8E5BD9" },
  "Trafford Park":      { displayName: "Trafford Park",  colour: "#E94B8A" },
};

const FALLBACK: Corridor = { displayName: "Unknown", colour: "#999999" };

export function corridorFor(name: string): Corridor {
  return CORRIDORS[name as CorridorName] ?? FALLBACK;
}

// TfGM labels every platform with its physical corridor. For interchanges
// (St Peter's Square, Cornbrook, etc.) that means an Altrincham-bound tram
// is incorrectly tagged with the platform's host corridor (e.g. "Eccles").
// This map corrects the corridor based on the tram's destination, so the
// row colour reflects the line the tram is actually running on.
//
// Destinations that could come from multiple lines (Piccadilly, Victoria,
// MediaCityUK) are intentionally left out — the platform corridor gives
// a reasonable default for those.
const DEST_TO_CORRIDOR: Record<string, CorridorName> = {
  "Altrincham": "Altrincham",
  "Ashton-Under-Lyne": "East Manchester",
  "Ashton-under-Lyne": "East Manchester",
  "Bury": "Bury",
  "East Didsbury": "South Manchester",
  "Eccles": "Eccles",
  "Manchester Airport": "Airport",
  "Rochdale Town Centre": "Oldham & Rochdale",
  "Rochdale": "Oldham & Rochdale",
  "Shaw and Crompton": "Oldham & Rochdale",
  "The Trafford Centre": "Trafford Park",
  "Trafford Centre": "Trafford Park",
};

export function corridorForDestination(destination: string, fallback: string): string {
  return DEST_TO_CORRIDOR[destination] ?? fallback;
}
