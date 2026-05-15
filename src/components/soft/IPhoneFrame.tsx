import { View, type ViewStyle } from "react-native";

// Realistic iPhone 15 Pro bezel for portfolio screenshots. Pure RN-Web —
// no SVG, no asset files — so it works inside Storybook captures.
//
// Dimensions modelled on the Pro (393×852 logical points). The frame
// adds ~14pt of bezel on each side + a Dynamic Island pill at the top,
// so the outer footprint is 421×880. Two visual tiers:
//   * outer  — graphite metallic edge (3pt gradient ring)
//   * bezel  — matte black inset (8pt)
// then the screen inside.

export function IPhoneFrame({
  children,
  screenWidth = 393,
  screenHeight = 852,
  // Default matches the app's lavender canvas (`lightColours.bg` in
  // lib/theme.ts). Screens that draw their own background paint over it;
  // ones that don't (Home greeting area) inherit a friendly wallpaper.
  background = "#F4F4FB",
  /** Show the Dynamic Island at the top of the screen. */
  island = true,
}: {
  children: React.ReactNode;
  screenWidth?: number;
  screenHeight?: number;
  background?: string;
  island?: boolean;
}) {
  const BEZEL = 11;
  const RING = 3;
  const TOTAL_PAD = BEZEL + RING;
  const outerRadius = 56;
  const screenRadius = outerRadius - TOTAL_PAD;

  const containerStyle: ViewStyle = {
    width: screenWidth + TOTAL_PAD * 2,
    height: screenHeight + TOTAL_PAD * 2,
    borderRadius: outerRadius,
    backgroundColor: "#1a1a1c",
    padding: RING,
    // The "metallic" edge — a faint highlight on the upper-right and a
    // soft shadow underneath the whole device.
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
  };

  const bezelStyle: ViewStyle = {
    width: screenWidth + BEZEL * 2,
    height: screenHeight + BEZEL * 2,
    borderRadius: outerRadius - RING,
    backgroundColor: "#000000",
    padding: BEZEL,
  };

  const screenStyle: ViewStyle = {
    width: screenWidth,
    height: screenHeight,
    borderRadius: screenRadius,
    overflow: "hidden",
    backgroundColor: background,
  };

  // The status-bar safe area on a Pro is ~59pt; we reserve that much at
  // the top of the rendered children so the Dynamic Island doesn't
  // overlap the greeting / page title. Screen content starts below.
  const STATUS_AREA = island ? 56 : 0;

  return (
    <View style={containerStyle}>
      <View style={bezelStyle}>
        <View style={screenStyle}>
          {STATUS_AREA > 0 && <View style={{ height: STATUS_AREA }} />}
          <View style={{ flex: 1 }}>{children}</View>
          {island && (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 10,
                left: "50%",
                marginLeft: -60,
                width: 120,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#000000",
              }}
            />
          )}
        </View>
      </View>
    </View>
  );
}
