# LiveActivityViews

Standalone Swift Package containing the SwiftUI view code for the
easymet Live Activity. Exists primarily so we can iterate on the design
in Xcode Previews — the widget extension's build chain (Expo + Pods +
RN) is too polluted for previews to render reliably there.

## Workflow

```
1. Quit any running Xcode session pointed at easymetmobile.xcworkspace
   (to avoid Xcode getting confused).
2. Open this package directly:
   open packages/live-activity-views/Package.swift
3. Wait for Xcode to resolve the package.
4. Open Sources/LiveActivityViews/Previews.swift.
5. Show the canvas (⌥⌘↩). Six states render side-by-side:
   - En route
   - Currently at
   - Alight (doors left)
   - Arrived
   - Bury line (different colour)
   - Light scheme
6. Edit any file in Sources/LiveActivityViews/ — canvas refreshes on
   save.
```

## Structure

| File | Purpose |
|---|---|
| `JourneyAttributesProviding.swift` | Protocol declaring every field the views read. The widget's real `JourneyActivityAttributes` (an ActivityKit type) satisfies it; so does the local `PreviewAttributes` (a plain struct). |
| `JourneyPhase.swift` | Enum (`boarded`, `inTransit`, `alightNext`, `arrived`). |
| `JourneySnapshot.swift` | Derives `currentIdx`, `phase`, `minutesToNextStop`, etc. from attributes + a Date. The view uses this each `TimelineView` render. |
| `LockScreenView.swift` | The main lock-screen view + all subviews (top row, header, ETA badge, footer, rail). Generic over `JourneyAttributesProviding`. |
| `Color+Hex.swift` | Hex-string → `Color` helper. |
| `Previews.swift` | `PreviewProvider` with six scenarios. |

## Adding a new preview state

Add another `stage(LockScreenView(attributes: ...))` to
`LockScreenView_Previews.previews`. Create a `make…()` builder if you
need a non-trivial scenario.

## Relationship to the widget extension

Right now the widget extension at
`ios/EasymetLiveActivity/EasymetLiveActivityLiveActivity.swift` keeps
its own copy of the view code. The two need to stay in sync manually
until/unless the widget is migrated to depend on this package.

Migration steps (optional, deferred):

1. In Xcode, open `ios/easymetmobile.xcworkspace`.
2. File → Add Package Dependencies → Add Local… → navigate to
   `packages/live-activity-views`.
3. Attach the `LiveActivityViews` library to the
   `EasymetLiveActivityExtension` target.
4. In `EasymetLiveActivityLiveActivity.swift`:
   - Delete the local copies of `LockScreenView`, `CardView`,
     `JourneySnapshot`, `JourneyPhase` (the package one wins), and
     the `Color(hex:)` extension.
   - Add `import LiveActivityViews`.
   - Add `extension JourneyActivityAttributes: JourneyAttributesProviding {}`
     (one line — the field names already match).
   - In `JourneyLiveActivity.body`, replace the inline `LockScreenView`
     init with `LockScreenView(attributes: context.attributes)`.
5. Rebuild the widget target.

When this migration lands, the package becomes the single source of
truth and the duplication goes away.
