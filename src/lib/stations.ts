import data from "../data/stations.json";

export interface Station {
  code: string;
  name: string;
  atcoCode: string;
  corridor: string;
  platforms: number;
  zone: number | null;
  lines: string[];
  lat: number | null;
  lng: number | null;
}

export interface CorridorEntry {
  name: string;
  colour: string;
}

const stations = data.stations as Station[];
const corridors = data.corridors as CorridorEntry[];

const byCode = new Map<string, Station>();
for (const s of stations) byCode.set(s.code, s);

export function allStations(): Station[] {
  return stations;
}

export function stationByCode(code: string): Station | undefined {
  return byCode.get(code);
}

export function allCorridors(): CorridorEntry[] {
  return corridors;
}

// Haversine distance in metres between two lat/lng pairs.
const R = 6371_000;
export function distanceMetres(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const lat1 = rad(a.lat);
  const lat2 = rad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function nearestStation(coord: { lat: number; lng: number }): Station | null {
  let best: { station: Station; d: number } | null = null;
  for (const s of stations) {
    if (s.lat == null || s.lng == null) continue;
    const d = distanceMetres(coord, { lat: s.lat, lng: s.lng });
    if (!best || d < best.d) best = { station: s, d };
  }
  return best?.station ?? null;
}

export function stationsByDistance(
  coord: { lat: number; lng: number },
  limit = 5,
): { station: Station; metres: number }[] {
  return stations
    .filter((s) => s.lat != null && s.lng != null)
    .map((s) => ({ station: s, metres: distanceMetres(coord, { lat: s.lat!, lng: s.lng! }) }))
    .sort((a, b) => a.metres - b.metres)
    .slice(0, limit);
}
