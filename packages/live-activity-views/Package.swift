// swift-tools-version: 5.9
//
// Standalone Swift Package containing the SwiftUI view code for the
// easymet Live Activity. Lives outside the Expo / Pods / RN build chain
// so the Xcode Previews canvas renders reliably here — the widget
// extension's build environment is too polluted for previews to work
// there.
//
// Workflow:
//   1. Open `Package.swift` (this file) in Xcode.
//   2. Xcode loads the package as its own project.
//   3. Open `Sources/LiveActivityViews/Previews.swift` — the canvas
//      shows every state side-by-side, refreshes on save.
//
// The widget extension currently keeps its own copy of the view code.
// Migrating it to import this package is a separate optional step;
// see README.md.

import PackageDescription

let package = Package(
    name: "LiveActivityViews",
    platforms: [
        .iOS(.v16),
        .macOS(.v13),
    ],
    products: [
        .library(
            name: "LiveActivityViews",
            targets: ["LiveActivityViews"]
        ),
    ],
    targets: [
        .target(
            name: "LiveActivityViews",
            path: "Sources/LiveActivityViews"
        ),
    ]
)
