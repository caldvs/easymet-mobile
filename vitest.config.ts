import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

// Vitest config. Most tests are pure-logic and run under happy-dom (needed
// for hook tests that use AsyncStorage, which RN's web build polyfills via
// localStorage). Aliases mirror the Expo Metro web setup so RN components
// resolve to react-native-web.
export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: ["./vitest.setup.ts"],
    // 10s hard cap per test prevents any future hang from stalling CI.
    testTimeout: 10_000,
    hookTimeout: 10_000,
    // Avoid parallel happy-dom worker hangs by running serially.
    fileParallelism: false,
  },
  resolve: {
    alias: [
      { find: /^react-native$/, replacement: "react-native-web" },
      // Avoid pulling expo-modules-core (which expects the native RN
      // bridge) into the node test environment. The stub exports the
      // shape of expo-location that JourneyContext / NearestLocationContext
      // import; the actual platform calls are never reached in tests.
      {
        find: /^expo-location$/,
        replacement: resolve(__dirname, "vitest-stubs/expo-location.ts"),
      },
      {
        // Local Expo module — same problem (expo-modules-core wants the
        // RN native bridge). Tests don't drive the Live Activity surface.
        // The exact relative import string from JourneyContext is what
        // Vite resolves against, so match that.
        find: "../../modules/journey-activity",
        replacement: resolve(__dirname, "vitest-stubs/journey-activity.ts"),
      },
    ],
  },
});
