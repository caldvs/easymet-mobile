import SwiftUI

// Plain SwiftUI previews of the lock-screen card. Open this file in
// Xcode (after opening `Package.swift` at the package root) and the
// canvas renders each state on save. PreviewProvider works on the older
// macOS deployment target this package targets; the canvas treats it
// identically to `#Preview` blocks.

struct PreviewAttributes: JourneyAttributesProviding {
    var lineId: String = "Altrincham"
    var lineName: String = "Altrincham"
    var lineColorHex: String = "#3FA9B5"
    var originStation: String = "Altrincham"
    var destinationStation: String = "Wythenshawe Town Centre"
    var totalStops: Int = 18
    var scheduledArrival: Date = Date(timeIntervalSinceNow: 21 * 60)

    var journeyStartedAt: Date = Date(timeIntervalSinceNow: -3 * 60)
    var secondsPerStop: Double = 90
    var simSpeedMultiplier: Double = 1

    var stationNames: [String] = [
        "Altrincham", "Navigation Road", "Timperley", "Brooklands",
        "Sale", "Dane Road", "Stretford", "Old Trafford",
        "Trafford Bar", "Cornbrook", "Deansgate - Castlefield",
        "St Peter's Square", "Market Street", "Shudehill", "Victoria",
        "Queens Road", "Abraham Moss", "Crumpsall", "Wythenshawe Town Centre",
    ]
    var lineColorByStation: [String] = Array(repeating: "#3FA9B5", count: 19)
    var doorsSide: String? = nil
}

struct LockScreenView_Previews: PreviewProvider {
    // Wraps the widget in a realistic Lock Screen mockup: wallpaper,
    // status bar, big time + date at the top, the activity card sitting
    // in the lower third where it'd actually appear, home indicator
    // at the bottom. Gives previews the surrounding context that
    // makes the widget read as "a Live Activity" instead of a
    // free-floating UI block.
    static func stage<V: View>(_ view: V) -> some View {
        LockScreenMockup {
            view
                .frame(width: 360)
                .clipShape(RoundedRectangle(cornerRadius: 22))
        }
        .previewLayout(.sizeThatFits)
    }

    static var previews: some View {
        Group {
            // En route, mid-journey — long destination name
            stage(LockScreenView(attributes: PreviewAttributes()))
                .previewDisplayName("En route")

            // Currently at a station — count-down hidden
            stage(LockScreenView(attributes: makeAtStation()))
                .previewDisplayName("Currently at")

            // Alight — red gradient + doors-left copy
            stage(LockScreenView(attributes: makeAlight()))
                .previewDisplayName("Alight (doors left)")

            // Arrived — single-line headline, footer hidden
            stage(LockScreenView(attributes: makeArrived()))
                .previewDisplayName("Arrived")

            // Different line / colour (Bury, yellow)
            stage(LockScreenView(attributes: makeBuryLine()))
                .previewDisplayName("Bury line")

            // Light scheme
            stage(LockScreenView(attributes: PreviewAttributes()))
                .preferredColorScheme(.light)
                .previewDisplayName("Light scheme")
        }
    }

    // MARK: Scenario builders

    /// Sim time positioned exactly on a station boundary so
    /// `minutesToNextStop` rounds to 0 → "Currently at" copy.
    static func makeAtStation() -> PreviewAttributes {
        var a = PreviewAttributes()
        a.journeyStartedAt = Date(timeIntervalSinceNow: -3 * 90) // ~3 stops in
        return a
    }

    static func makeAlight() -> PreviewAttributes {
        var a = PreviewAttributes()
        // 1 stop short of arrival
        a.journeyStartedAt = Date(timeIntervalSinceNow: -17 * 90 - 30)
        a.doorsSide = "left"
        return a
    }

    static func makeArrived() -> PreviewAttributes {
        var a = PreviewAttributes()
        a.journeyStartedAt = Date(timeIntervalSinceNow: -18 * 90 - 10)
        return a
    }

    static func makeBuryLine() -> PreviewAttributes {
        var a = PreviewAttributes()
        a.lineId = "Bury"
        a.lineName = "Bury"
        a.lineColorHex = "#F2C14E"
        a.originStation = "Piccadilly"
        a.destinationStation = "Bury"
        a.totalStops = 13
        a.stationNames = [
            "Piccadilly", "Piccadilly Gardens", "Market Street",
            "Shudehill", "Victoria", "Queens Road", "Abraham Moss",
            "Crumpsall", "Bowker Vale", "Heaton Park", "Prestwich",
            "Besses o' th' Barn", "Whitefield", "Bury",
        ]
        a.lineColorByStation = Array(repeating: "#F2C14E", count: 14)
        a.journeyStartedAt = Date(timeIntervalSinceNow: -2 * 90)
        return a
    }
}

// MARK: - Lock Screen mockup

/// Fake Lock Screen scaffold. Approximates iOS 18's vertical layout:
/// status bar at top, big time + date in the upper third, the slot
/// where the Live Activity actually sits (~70 % down), home indicator
/// at the bottom. The exact pixel proportions don't need to be
/// production-perfect — the goal is to render the widget in a context
/// that reads as "lock screen" rather than "floating in a void".
struct LockScreenMockup<Content: View>: View {
    let content: () -> Content

    var body: some View {
        ZStack {
            // Wallpaper: warm purple → indigo gradient, roughly the
            // default iOS abstract one. Replace with an Image if you
            // want pixel-accurate fidelity.
            LinearGradient(
                colors: [
                    Color(red: 0.50, green: 0.20, blue: 0.45),
                    Color(red: 0.35, green: 0.18, blue: 0.55),
                    Color(red: 0.12, green: 0.08, blue: 0.30),
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            // Status bar (clock, wifi, battery placeholders).
            VStack(spacing: 0) {
                HStack {
                    Text(Date(), format: .dateTime.hour().minute())
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundStyle(.white)
                    Spacer()
                    HStack(spacing: 6) {
                        Image(systemName: "wifi")
                        Image(systemName: "battery.100")
                    }
                    .font(.system(size: 15, weight: .medium))
                    .foregroundStyle(.white)
                }
                .padding(.horizontal, 28)
                .padding(.top, 14)
                Spacer()
            }

            // Date + time stack — high in the screen.
            VStack(spacing: 0) {
                Spacer().frame(height: 80)
                Text(Date(), format: .dateTime.weekday(.wide).day().month(.wide))
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundStyle(.white)
                Text(Date(), format: .dateTime.hour().minute())
                    .font(.system(size: 96, weight: .thin))
                    .foregroundStyle(Color(red: 1.0, green: 0.85, blue: 0.88))
                Spacer()
            }

            // The Live Activity slot — ~3/4 down the screen.
            VStack {
                Spacer()
                content()
                    .shadow(color: Color.black.opacity(0.25), radius: 12, y: 4)
                Spacer().frame(height: 90)
            }

            // "Swipe up to open" hint + home indicator.
            VStack(spacing: 14) {
                Spacer()
                Text("Swipe up to open")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(.white.opacity(0.7))
                Capsule()
                    .fill(.white)
                    .frame(width: 134, height: 5)
                    .padding(.bottom, 8)
            }
        }
        .frame(width: 393, height: 700)
        .clipShape(RoundedRectangle(cornerRadius: 48))
    }
}
