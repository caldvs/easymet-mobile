import SwiftUI

/// The lock-screen lock-up of the easymet Live Activity. Wraps a
/// `TimelineView` that re-evaluates the view content periodically off
/// the static attributes + wall-clock time.
///
/// Use this directly in `ActivityConfiguration(...) { context in ... }`
/// inside a `Widget`, or in any plain SwiftUI scene (Previews, a macOS
/// playground app, etc.).
public struct LockScreenView<A: JourneyAttributesProviding>: View {
    public let attributes: A

    public init(attributes: A) {
        self.attributes = attributes
    }

    public var body: some View {
        TimelineView(.periodic(from: attributes.journeyStartedAt, by: cadence)) { context in
            let snapshot = JourneySnapshot(attributes: attributes, now: context.date)
            CardView(attributes: attributes, snapshot: snapshot)
        }
    }

    /// Refresh cadence is derived from secondsPerStop so accelerated
    /// sim runs get more frequent re-renders; floored at 5s to avoid
    /// silly-fast schedules; capped at 30s to stay polite.
    private var cadence: TimeInterval {
        max(5, min(attributes.secondsPerStop / 3.0, 30))
    }
}

// MARK: - Card

struct CardView<A: JourneyAttributesProviding>: View {
    let attributes: A
    let snapshot: JourneySnapshot
    @Environment(\.colorScheme) private var colourScheme

    private var lineColor: Color { Color(hex: snapshot.lineColorHex) ?? .blue }
    private var isAlight: Bool { snapshot.phase == .alightNext }
    private var isArrived: Bool { snapshot.phase == .arrived }
    private var isLight: Bool { colourScheme == .light }

    private var cardBg: Color {
        if isAlight { return Color(hex: "#C24A2C")! }
        return isLight ? Color(hex: "#FFFCF7")! : Color(hex: "#16161A")!
    }
    private var primaryText: Color {
        isAlight ? .white : (isLight ? Color(hex: "#15151A")! : Color(hex: "#F5F5F7")!)
    }
    private var mutedText: Color {
        isAlight
            ? Color.white.opacity(0.72)
            : (isLight ? Color.black.opacity(0.55) : Color.white.opacity(0.55))
    }
    private var subtleText: Color {
        isAlight
            ? Color.white.opacity(0.55)
            : (isLight ? Color.black.opacity(0.38) : Color.white.opacity(0.38))
    }
    private var railTrack: Color {
        isAlight ? Color.white.opacity(0.25) : (isLight ? Color.black.opacity(0.10) : Color.white.opacity(0.10))
    }
    private var railFill: Color { isAlight ? .white : lineColor }
    private var railTickInactive: Color {
        isAlight ? Color.white.opacity(0.40) : (isLight ? Color.black.opacity(0.18) : Color.white.opacity(0.18))
    }
    private var atStation: Bool {
        !isAlight && !isArrived && snapshot.minutesToNextStop == 0
    }

    var body: some View {
        // `.background(_:)` (not ZStack-with-Color-sibling) is important:
        // Color and LinearGradient views always expand to fill available
        // space, so a sibling in ZStack would make the whole card stretch
        // whenever the surrounding container is taller than the content.
        // The real widget extension is fine because iOS imposes a fixed
        // frame, but for previews / macOS hosts the card needs to size
        // to its content first and have the background fill behind it.
        content.background(background)
    }

    @ViewBuilder private var background: some View {
        if isAlight {
            LinearGradient(
                colors: [Color(hex: "#E55934")!, Color(hex: "#B14225")!],
                startPoint: .top, endPoint: .bottom
            )
        } else {
            cardBg
        }
    }

    private var content: some View {
        VStack(alignment: .leading, spacing: 10) {
            topRow
            headerLeft
            railBlock
            if !isArrived { footerRow }
        }
        .padding(.horizontal, 18)
        .padding(.top, 14)
        .padding(.bottom, 16)
    }

    // MARK: Top row

    private var topRow: some View {
        HStack(alignment: .center, spacing: 10) {
            ZStack {
                RoundedRectangle(cornerRadius: 7).fill(isAlight ? Color.white.opacity(0.20) : lineColor)
                tramGlyph.frame(width: 13, height: 13).foregroundStyle(.white)
            }
            .frame(width: 24, height: 24)

            Text("easymet")
                .font(.system(size: 15, weight: .medium))
                .foregroundStyle(primaryText)
                .lineLimit(1)

            Spacer()

            etaInline
        }
    }

    private var etaInline: some View {
        HStack(alignment: .firstTextBaseline, spacing: 6) {
            Text(isAlight || isArrived ? "ARR" : "ETA")
                .font(.system(size: 11, weight: .semibold))
                .tracking(0.8)
                .foregroundStyle(subtleText)
            Text(attributes.scheduledArrival, format: .dateTime.hour().minute())
                .font(.system(size: 22, weight: .bold, design: .default))
                .monospacedDigit()
                .foregroundStyle(primaryText)
                .lineLimit(1)
        }
    }

    private var tramGlyph: some View {
        Canvas { ctx, size in
            let s = size.width / 24
            let stroke = StrokeStyle(lineWidth: 1.8 * s, lineCap: .round, lineJoin: .round)
            let body = Path(roundedRect: CGRect(x: 5*s, y: 3*s, width: 14*s, height: 14*s), cornerRadius: 3*s)
            ctx.stroke(body, with: .color(.white), style: stroke)
            for cx in [9.0, 15.0] {
                ctx.fill(
                    Path(ellipseIn: CGRect(x: (cx - 1.2)*s, y: (13.0 - 1.2)*s, width: 2.4*s, height: 2.4*s)),
                    with: .color(.white)
                )
            }
            var band = Path()
            band.move(to: CGPoint(x: 5*s, y: 9*s))
            band.addLine(to: CGPoint(x: 19*s, y: 9*s))
            ctx.stroke(band, with: .color(.white), style: stroke)
            var lf = Path(); lf.move(to: CGPoint(x: 8*s, y: 20*s)); lf.addLine(to: CGPoint(x: 7*s, y: 22*s))
            ctx.stroke(lf, with: .color(.white), style: stroke)
            var rf = Path(); rf.move(to: CGPoint(x: 16*s, y: 20*s)); rf.addLine(to: CGPoint(x: 17*s, y: 22*s))
            ctx.stroke(rf, with: .color(.white), style: stroke)
        }
    }

    // MARK: Header

    private var headerLeft: some View {
        VStack(alignment: .leading, spacing: 1) {
            Text(headerKicker)
                .font(.system(size: 13, weight: .regular))
                .foregroundStyle(mutedText)
                .lineLimit(1)
            HStack(alignment: .firstTextBaseline, spacing: 6) {
                Text(attributes.destinationStation)
                    .font(.system(size: 24, weight: .semibold))
                    .foregroundStyle(primaryText)
                    .lineLimit(1)
                    .truncationMode(.tail)
                if snapshot.stopsRemaining > 1 && !isArrived {
                    Text("in \(snapshot.stopsRemaining) stops")
                        .font(.system(size: 13, weight: .regular))
                        .foregroundStyle(mutedText)
                        .lineLimit(1)
                        .fixedSize(horizontal: true, vertical: false)
                }
            }
        }
    }

    private var headerKicker: String {
        if isArrived { return "Arrived at" }
        if isAlight {
            switch attributes.doorsSide {
            case "right": return "Doors right at"
            case "left":  return "Doors left at"
            default:      return "Alight at"
            }
        }
        return "Heading to"
    }

    // MARK: Footer

    private var footerRow: some View {
        HStack(alignment: .firstTextBaseline, spacing: 6) {
            Text(footerPrefix)
                .font(.system(size: 14, weight: .regular))
                .foregroundStyle(mutedText)
                .lineLimit(1)
                .fixedSize(horizontal: true, vertical: false)
            Text(snapshot.nextStopName)
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(primaryText)
                .lineLimit(1)
                .truncationMode(.tail)
            if !atStation {
                countdown
                    .fixedSize(horizontal: true, vertical: false)
            }
            Spacer(minLength: 0)
        }
    }

    private var footerPrefix: String {
        if isAlight {
            switch attributes.doorsSide {
            case "right": return "Doors right at"
            case "left":  return "Doors left at"
            default:      return "Alight at"
            }
        }
        if atStation { return "Currently at" }
        return "Next stop is"
    }

    private var countdown: some View {
        let m = max(snapshot.minutesToNextStop, 0)
        return Text(m == 0 ? "now" : "in \(m) min")
            .font(.system(size: 14, weight: .regular))
            .monospacedDigit()
            .foregroundStyle(mutedText)
            .lineLimit(1)
    }

    // MARK: Rail

    private var railBlock: some View {
        let total = max(attributes.totalStops, 1)
        let completed = max(0, min(total, total - snapshot.stopsRemaining))
        let progress = min(max(Double(completed) / Double(total), 0.03), 0.97)

        return GeometryReader { geo in
            let w = geo.size.width
            ZStack {
                Capsule().fill(railTrack)
                    .frame(width: w, height: 3)
                    .position(x: w / 2, y: 7)
                Capsule().fill(railFill)
                    .frame(width: max(w * progress, 4), height: 3)
                    .position(x: max(w * progress, 4) / 2, y: 7)
                ForEach(1..<total, id: \.self) { i in
                    let x = w * Double(i) / Double(total)
                    let passed = i < completed
                    Rectangle()
                        .fill(passed ? railFill.opacity(0.55) : railTickInactive)
                        .frame(width: 1.5, height: 5)
                        .position(x: x, y: 7)
                }
                Circle()
                    .fill(railFill)
                    .frame(width: 9, height: 9)
                    .overlay(Circle().strokeBorder(cardBg, lineWidth: 2))
                    .position(x: 4.5, y: 7)
                Circle()
                    .fill(cardBg)
                    .frame(width: 9, height: 9)
                    .overlay(Circle().strokeBorder(railFill, lineWidth: 2))
                    .position(x: w - 4.5, y: 7)
                ZStack {
                    Circle()
                        .fill(railFill.opacity(0.22))
                        .frame(width: 22, height: 22)
                    Circle()
                        .fill(.white)
                        .frame(width: 14, height: 14)
                        .overlay(Circle().strokeBorder(railFill, lineWidth: 3))
                }
                .position(x: w * progress, y: 7)
            }
            .frame(width: w, height: 14)
        }
        .frame(height: 14)
        .padding(.vertical, 6)
    }
}
