import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";
import type { StorybookConfig } from "@storybook/react-vite";

const __dir = dirname(fileURLToPath(import.meta.url));
const stub = (name: string) => resolve(__dir, `stubs/${name}`);

// Storybook for the Easy Met design system. The app is Expo + React Native
// + react-native-web, so we alias `react-native` to `react-native-web` and
// stub the Expo packages that ship Flow/native sources Vite can't parse.
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx|mdx)"],
  addons: [],
  framework: { name: "@storybook/react-vite", options: {} },
  staticDirs: ["./public"],
  viteFinal: async (cfg) =>
    mergeConfig(cfg, {
      resolve: {
        alias: [
          { find: /^react-native$/, replacement: "react-native-web" },
          { find: /^expo-blur$/, replacement: stub("expo-blur.tsx") },
          { find: /^expo-linear-gradient$/, replacement: stub("expo-linear-gradient.tsx") },
          { find: /^expo-glass-effect$/, replacement: stub("expo-glass-effect.tsx") },
          { find: /^@expo\/ui\/swift-ui$/, replacement: stub("expo-ui-swift-ui.tsx") },
          { find: /^@expo\/ui\/swift-ui\/modifiers$/, replacement: stub("expo-ui-swift-ui-modifiers.tsx") },
          { find: /^expo-location$/, replacement: stub("expo-location.tsx") },
          { find: /^expo-haptics$/, replacement: stub("expo-haptics.tsx") },
          { find: /^expo-modules-core$/, replacement: stub("expo-modules-core.tsx") },
          { find: /^@expo\/vector-icons$/, replacement: stub("expo-vector-icons.tsx") },
          { find: /^@expo\/vector-icons\/Ionicons$/, replacement: stub("expo-vector-icons-ionicons.tsx") },
          { find: /^expo-router$/, replacement: stub("expo-router.tsx") },
          { find: /^react-native-safe-area-context$/, replacement: stub("react-native-safe-area-context.tsx") },
          { find: /^react-native-svg$/, replacement: stub("react-native-svg.tsx") },
        ],
        extensions: [".web.tsx", ".web.ts", ".web.jsx", ".web.js", ".tsx", ".ts", ".jsx", ".js"],
      },
      define: {
        __DEV__: JSON.stringify(true),
        "process.env.EXPO_OS": JSON.stringify("web"),
      },
      optimizeDeps: {
        // Force-bundle React + react-native-web so Vite's pre-bundling step
        // emits a synthetic default export for the CJS-style `import React`
        // that some Storybook internals (and any RN-Web shim) still use.
        include: ["react", "react-dom", "react-native-web", "buffer"],
        exclude: [
          "react-native",
          "expo-blur",
          "expo-linear-gradient",
          "expo-glass-effect",
          "@expo/ui",
          "expo-location",
          "expo-haptics",
          "expo-modules-core",
          "@expo/vector-icons",
          "expo-router",
          "react-native-safe-area-context",
          // Force per-file resolution so `.web.js` variants get picked up.
          "react-native-svg",
        ],
        esbuildOptions: {
          // Provide a CJS-to-ESM default-export bridge for any package
          // re-exporting React.
          loader: { ".js": "jsx" },
        },
      },
      esbuild: {
        // Use the automatic JSX runtime — no need for `import React`.
        jsx: "automatic",
      },
    }),
};

export default config;
