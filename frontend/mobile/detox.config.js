module.exports = {
  testRunner: "jest",
  runnerConfig: "jest.config.e2e.js",
  skipLegacyWorkersInjection: true,
  apps: {
    ios: {
      type: "ios.app",
      build: "yarn ios-e2e",
      binaryPath: "ios/build/Build/Products/Debug-iphonesimulator/mobile.app",
    },
    android: {
      type: "android.apk",
      binaryPath: "SPECIFY_PATH_TO_YOUR_APP_BINARY",
    },
  },
  devices: {
    simulator: {
      type: "ios.simulator",
      device: {
        id: "6006EA6B-C580-4619-A7D9-9F2DC5281659",
        type: "iPhone 12",
        name: "iPhone 12 Detox",
      },
    },
    emulator: {
      type: "android.emulator",
      device: {
        avdName: "Pixel_3a_API_30_x86",
      },
    },
  },
  configurations: {
    ios: {
      device: "simulator",
      app: "ios",
    },
    android: {
      device: "emulator",
      app: "android",
    },
  },
};
