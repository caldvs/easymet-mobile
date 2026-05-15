import Foundation

/// All the journey data the view code needs. Modelled as a protocol so
/// the views can be rendered both from the real `JourneyActivityAttributes`
/// (which conforms to `ActivityKit.ActivityAttributes`) and from a
/// plain in-package `PreviewAttributes` struct used by Previews + any
/// future macOS playground.
public protocol JourneyAttributesProviding {
    var lineId: String { get }
    var lineName: String { get }
    /// First segment's hex colour — used as a fallback when
    /// `lineColorByStation` can't resolve the current index.
    var lineColorHex: String { get }
    var originStation: String { get }
    var destinationStation: String { get }
    var totalStops: Int { get }
    var scheduledArrival: Date { get }

    var journeyStartedAt: Date { get }
    var secondsPerStop: Double { get }
    /// Dev multiplier. 1 in production; > 1 compresses time for testing.
    var simSpeedMultiplier: Double { get }

    /// All stations on the route in order. Length = totalStops + 1.
    var stationNames: [String] { get }
    /// Active line hex colour at each station. Same length as
    /// `stationNames`.
    var lineColorByStation: [String] { get }

    /// "left" / "right" / "both" / nil. Drives the alight-phase copy.
    var doorsSide: String? { get }
}
