import * as Haptics from "expo-haptics";
import { Image, Pressable, View } from "react-native";
import { useTheme } from "../lib/TweaksContext";

// Map-tile preview. Uses CARTO's Positron basemap (light, minimal style)
// for a much cleaner look than vanilla OpenStreetMap tiles. Renders a 2x2
// tile quadrant centred on the station so the visible window is always
// fully covered, regardless of where the station sits within its slippy
// tile boundary. Accent-coloured pin marks the station, optional blue
// dot shows the user.
//
// One tap → opens Apple Maps with walking directions from the user's
// current location to the station.
//
// CARTO basemaps usage: free under attribution requirement
// (© OpenStreetMap contributors © CARTO). At app scale we should switch
// to a paid provider or self-hosted tiles.

const TILE_ZOOM = 15;
const TILE_PX = 256;

function slippyTile(lat: number, lng: number, zoom: number) {
  const n = 2 ** zoom;
  const xExact = ((lng + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const yExact =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return {
    x: Math.floor(xExact),
    y: Math.floor(yExact),
    // Fractional offset within the tile (0..1) so we can position the marker
    // exactly over the station instead of always at the tile centre.
    fx: xExact - Math.floor(xExact),
    fy: yExact - Math.floor(yExact),
  };
}

function tileUrl(zoom: number, x: number, y: number) {
  return `https://basemaps.cartocdn.com/light_all/${zoom}/${x}/${y}.png`;
}

export function MiniMap({
  lat,
  lng,
  userLat,
  userLng,
  size = 56,
  onPress,
}: {
  lat: number;
  lng: number;
  userLat?: number | null;
  userLng?: number | null;
  size?: number;
  onPress?: () => void;
}) {
  const colours = useTheme();
  const { x, y, fx, fy } = slippyTile(lat, lng, TILE_ZOOM);

  // Position the station's tile so its fractional point sits at the centre
  // of the visible window.
  const offsetX = -fx * TILE_PX + size / 2;
  const offsetY = -fy * TILE_PX + size / 2;

  // Determine which neighbour tile to add for full coverage: the one in
  // the same quadrant as the station's fractional position. Render the
  // station's tile + 3 neighbours (a 2x2 quadrant) so the visible window
  // is always covered regardless of edge proximity.
  const dx = fx < 0.5 ? -1 : 1;
  const dy = fy < 0.5 ? -1 : 1;
  const tiles = [
    { tx: x, ty: y, ox: offsetX, oy: offsetY },
    { tx: x + dx, ty: y, ox: offsetX + dx * TILE_PX, oy: offsetY },
    { tx: x, ty: y + dy, ox: offsetX, oy: offsetY + dy * TILE_PX },
    { tx: x + dx, ty: y + dy, ox: offsetX + dx * TILE_PX, oy: offsetY + dy * TILE_PX },
  ];

  // User dot position relative to the station, computed from the tile
  // projection. Same projection, different lat/lng → pixel delta.
  let userDot: { left: number; top: number } | null = null;
  if (userLat != null && userLng != null) {
    const u = slippyTile(userLat, userLng, TILE_ZOOM);
    const userPxX = (u.x - x + u.fx - fx) * TILE_PX;
    const userPxY = (u.y - y + u.fy - fy) * TILE_PX;
    const left = size / 2 + userPxX;
    const top = size / 2 + userPxY;
    if (left >= 0 && left <= size && top >= 0 && top <= size) {
      userDot = { left, top };
    }
  }

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => undefined);
        onPress?.();
      }}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colours.chromeBorder,
        backgroundColor: "#E5E5EA",
        opacity: pressed ? 0.7 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
      accessibilityLabel="Walking directions to this station"
    >
      {tiles.map((t) => (
        <Image
          key={`${t.tx},${t.ty}`}
          source={{ uri: tileUrl(TILE_ZOOM, t.tx, t.ty) }}
          style={{
            position: "absolute",
            width: TILE_PX,
            height: TILE_PX,
            left: t.ox,
            top: t.oy,
          }}
        />
      ))}
      {userDot && (
        <View
          style={{
            position: "absolute",
            left: userDot.left - 4,
            top: userDot.top - 4,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#2A6FDB",
            borderWidth: 1.5,
            borderColor: "#fff",
          }}
        />
      )}
      <View
        style={{
          position: "absolute",
          left: size / 2 - 5,
          top: size / 2 - 5,
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: colours.accent,
          borderWidth: 1.5,
          borderColor: "#fff",
        }}
      />
    </Pressable>
  );
}
