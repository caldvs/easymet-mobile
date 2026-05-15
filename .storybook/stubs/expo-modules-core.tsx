// Stub of expo-modules-core for Storybook. The real package contains
// `import { TurboModuleRegistry } from 'react-native'` paths that fail
// when react-native is aliased to react-native-web (rn-web doesn't expose
// that symbol). The Storybook preview never reaches into native bridges,
// so we provide just the surface that other Expo packages reach for at
// module-load time.

export const NativeModulesProxy = new Proxy({}, { get: () => () => undefined });
export const EventEmitter = class {
  addListener() { return { remove: () => {} }; }
  removeAllListeners() {}
  removeSubscription() {}
  emit() {}
};
export const Platform = { OS: "web" as const };
export const CodedError = class extends Error {
  code: string;
  constructor(code: string, message?: string) {
    super(message);
    this.code = code;
  }
};
export const UnavailabilityError = class extends CodedError {
  constructor(moduleName: string, propertyName: string) {
    super("ERR_UNAVAILABLE", `${moduleName}.${propertyName} is not available on this platform.`);
  }
};
export function requireNativeModule(_name: string): unknown {
  return new Proxy({}, { get: () => () => undefined });
}
export function requireOptionalNativeModule(_name: string): unknown {
  return null;
}
export function requireNativeViewManager(_name: string): unknown {
  return () => null;
}
export function registerWebModule(mod: unknown): unknown {
  return mod;
}
export class NativeModule<T = unknown> {
  // intentionally empty — concrete Expo modules subclass this in their web
  // builds, but at module-load time only the constructor reference matters.
  constructor(..._args: unknown[]) {}
}
export function uuid() {
  return Math.random().toString(36).slice(2);
}
export const SharedObject = class {};
export const SharedRef = class {};
export default {};
