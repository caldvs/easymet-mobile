import ActivityKit
import ExpoModulesCore
import Foundation
import UIKit

// Bridges the journey Live Activity in/out of JavaScript.
//
// After the refactor, JS only calls `start` (passing all journey data
// up front) and `end`. The widget computes its own current state from
// the static attributes + wall-clock time inside a TimelineView, so
// there is no periodic `update` call any more. This lets the count-down
// keep ticking when the app is backgrounded (the JS runtime suspends
// while iOS continues to render the widget on the timeline schedule).

private struct JourneyStartArgs: Record {
  @Field var lineId: String = ""
  @Field var lineName: String = ""
  @Field var lineColorHex: String = "#0A84FF"
  @Field var originStation: String = ""
  @Field var destinationStation: String = ""
  @Field var totalStops: Int = 1
  @Field var scheduledArrivalEpochSeconds: Double = 0
  @Field var journeyStartedAtEpochSeconds: Double = 0
  @Field var secondsPerStop: Double = 90
  @Field var simSpeedMultiplier: Double = 1
  @Field var stationNames: [String] = []
  @Field var lineColorByStation: [String] = []
  @Field var doorsSide: String? = nil
  @Field var isDelayed: Bool = false
}

public class JourneyActivityModule: Module {
  private var currentActivityId: String?
  private var pushTokenTask: Task<Void, Never>?

  public func definition() -> ModuleDefinition {
    Name("JourneyActivity")

    // Emitted whenever an activity's push token is issued or rotated by
    // APNs. JS captures it and POSTs to the push server so the server
    // can target updates at this specific activity instance.
    Events("onActivityPushToken")

    Function("isSupported") { () -> Bool in
      if #available(iOS 16.1, *) {
        return ActivityAuthorizationInfo().areActivitiesEnabled
      }
      return false
    }

    AsyncFunction("start") { (args: JourneyStartArgs, promise: Promise) in
      guard #available(iOS 16.2, *) else {
        promise.reject("E_UNSUPPORTED", "Live Activities require iOS 16.2+")
        return
      }
      guard ActivityAuthorizationInfo().areActivitiesEnabled else {
        promise.reject("E_DISABLED", "Live Activities are disabled in Settings.")
        return
      }
      let attributes = JourneyActivityAttributes(
        lineId: args.lineId,
        lineName: args.lineName,
        lineColorHex: args.lineColorHex,
        originStation: args.originStation,
        destinationStation: args.destinationStation,
        totalStops: args.totalStops,
        scheduledArrival: Date(timeIntervalSince1970: args.scheduledArrivalEpochSeconds),
        journeyStartedAt: Date(timeIntervalSince1970: args.journeyStartedAtEpochSeconds),
        secondsPerStop: args.secondsPerStop,
        simSpeedMultiplier: args.simSpeedMultiplier,
        stationNames: args.stationNames,
        lineColorByStation: args.lineColorByStation,
        doorsSide: args.doorsSide
      )
      let initialState = JourneyActivityAttributes.ContentState(
        isDelayed: args.isDelayed,
        tick: 0
      )
      // Try with push token support first. If the app lacks the Push
      // Notifications entitlement (no Apple Developer account yet, no
      // aps-environment in the .entitlements file), Activity.request
      // throws — we then retry without pushType. The activity still
      // works locally; the push server just sits idle until the
      // entitlement is added.
      let activity: Activity<JourneyActivityAttributes>
      do {
        activity = try Activity<JourneyActivityAttributes>.request(
          attributes: attributes,
          content: .init(state: initialState, staleDate: nil),
          pushType: .token
        )
        NSLog("[JourneyActivity] started with pushType: .token")
      } catch {
        NSLog("[JourneyActivity] .token request failed (\(error.localizedDescription)) — retrying without pushType")
        do {
          activity = try Activity<JourneyActivityAttributes>.request(
            attributes: attributes,
            content: .init(state: initialState, staleDate: nil),
            pushType: nil
          )
        } catch {
          promise.reject("E_START_FAILED", error.localizedDescription)
          return
        }
      }
      self.currentActivityId = activity.id

      // Watch for the activity's APNs push token. The first token
      // typically arrives within ~1s of `request()`. If the activity
      // was created without pushType, pushTokenUpdates simply never
      // emits and this task waits indefinitely (cancelled on `end`).
      self.pushTokenTask?.cancel()
      self.pushTokenTask = Task {
        for await tokenData in activity.pushTokenUpdates {
          let hex = tokenData.map { String(format: "%02x", $0) }.joined()
          self.sendEvent("onActivityPushToken", [
            "activityId": activity.id,
            "token": hex
          ])
        }
      }

      promise.resolve(activity.id)
    }

    AsyncFunction("end") { (promise: Promise) in
      guard #available(iOS 16.2, *) else {
        promise.resolve(nil)
        return
      }
      Task {
        let id = self.currentActivityId
        let activities = Activity<JourneyActivityAttributes>.activities
        for activity in activities where id == nil || activity.id == id {
          await activity.end(nil, dismissalPolicy: .immediate)
        }
        self.currentActivityId = nil
        self.pushTokenTask?.cancel()
        self.pushTokenTask = nil
        promise.resolve(nil)
      }
    }
  }
}
