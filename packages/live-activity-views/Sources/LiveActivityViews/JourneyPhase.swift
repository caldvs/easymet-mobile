import Foundation

public enum JourneyPhase: String, Sendable, Hashable {
    case boarded
    case inTransit
    case alightNext
    case arrived
}
