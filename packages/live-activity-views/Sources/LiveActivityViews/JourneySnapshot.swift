import Foundation

/// Everything the lock-screen view needs at a moment in time, derived
/// from the static journey attributes + the current wall-clock date.
public struct JourneySnapshot {
    public let phase: JourneyPhase
    public let currentIdx: Int
    public let currentStationName: String
    public let nextStopName: String
    public let stopsRemaining: Int
    public let minutesToNextStop: Int
    public let lineColorHex: String

    public init<A: JourneyAttributesProviding>(attributes: A, now: Date) {
        let secondsPerStop = max(attributes.secondsPerStop, 1)
        let totalStations = max(attributes.stationNames.count, 1)
        let totalStops = max(totalStations - 1, 1)

        let elapsed = max(0, now.timeIntervalSince(attributes.journeyStartedAt))
        let computedIdx = Int(elapsed / secondsPerStop)
        currentIdx = min(computedIdx, totalStations - 1)

        currentStationName = attributes.stationNames[safeIndex: currentIdx]
            ?? attributes.originStation
        nextStopName = attributes.stationNames[safeIndex: currentIdx + 1]
            ?? attributes.destinationStation

        stopsRemaining = max(totalStops - currentIdx, 0)

        let arrived = currentIdx >= totalStations - 1
        if arrived {
            phase = .arrived
        } else if stopsRemaining == 1 {
            phase = .alightNext
        } else if currentIdx == 0 {
            phase = .boarded
        } else {
            phase = .inTransit
        }

        // Sim minutes: real seconds remaining scaled up so accelerated
        // dev runs still display realistic "in N min" copy. At 1×
        // this is identity.
        let nextArrival = attributes.journeyStartedAt
            .addingTimeInterval(Double(currentIdx + 1) * secondsPerStop)
        let realRemaining = max(0, nextArrival.timeIntervalSince(now))
        let simRemaining = realRemaining * attributes.simSpeedMultiplier
        minutesToNextStop = max(0, Int((simRemaining / 60).rounded()))

        lineColorHex = attributes.lineColorByStation[safeIndex: currentIdx]
            ?? attributes.lineColorHex
    }
}

extension Array {
    fileprivate subscript(safeIndex index: Int) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}
