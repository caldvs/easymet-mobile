//
//  JourneyActivityAttributes.swift
//  Shared between the JourneyActivity pod (main app) and the
//  EasymetLiveActivity widget extension. The widget keeps an inline copy
//  of this same struct so its compilation unit has access to it; the two
//  copies MUST stay byte-identical in field names, types and order.
//
//  Journey timing (startedAt, secondsPerStop, station list, etc.) lives
//  in attributes so the widget can compute its own state autonomously
//  inside a TimelineView. This keeps the lock-screen count-down ticking
//  without the JS runtime — when the app is backgrounded, JS suspends,
//  but iOS keeps re-rendering the widget on the timeline schedule.
//

import ActivityKit
import Foundation

public enum JourneyPhase: String, Codable, Hashable, Sendable {
    case boarded
    case inTransit
    case alightNext
    case arrived
}

public struct JourneyActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        /// Reserved for future use (push-driven delay notifications).
        public var isDelayed: Bool
        /// Monotonically-increasing counter pushed from JS to force iOS
        /// to re-render the widget. The widget's view doesn't read this;
        /// it exists purely so that `activity.update(...)` calls produce
        /// a fresh ContentState diff that iOS treats as a "real" change.
        /// Live Activity widgets don't honour TimelineView periodic
        /// schedules, so we drive re-renders this way while the app is
        /// in the foreground. Background freezes are unavoidable without
        /// push notifications.
        public var tick: Int
    }

    // Static identity
    public var lineId: String
    public var lineName: String
    /// First segment's colour, used as a fallback if `lineColorByStation`
    /// can't resolve the current index for some reason.
    public var lineColorHex: String
    public var originStation: String
    public var destinationStation: String
    public var totalStops: Int
    public var scheduledArrival: Date

    // Journey timing — used by the widget's TimelineView to compute
    // current state from elapsed wall-clock time.
    public var journeyStartedAt: Date
    public var secondsPerStop: Double
    /// Dev multiplier: displayed minutes are scaled by this so an
    /// accelerated sim still shows realistic "in N min" copy.
    public var simSpeedMultiplier: Double

    // Per-station data, indexed 0..<totalStations.
    /// All stations on the route, in order, including origin and
    /// destination. `totalStops + 1` entries.
    public var stationNames: [String]
    /// Hex colour of the line active at each station. For multi-segment
    /// routes the value swaps at each transfer boundary.
    public var lineColorByStation: [String]

    /// Door-side cue for the alight phase. "left" / "right" / "both"
    /// / nil. Resolved once at journey start.
    public var doorsSide: String?
}
