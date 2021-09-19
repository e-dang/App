module.exports = {
    testRunner: 'jest',
    runnerConfig: 'e2e/config.json',
    skipLegacyWorkersInjection: true,
    apps: {
        ios: {
            type: 'ios.app',
            build: 'yarn ios',
            binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/mobile.app',
        },
        android: {
            type: 'android.apk',
            binaryPath: 'SPECIFY_PATH_TO_YOUR_APP_BINARY',
        },
    },
    devices: {
        simulator: {
            type: 'ios.simulator',
            device: {
                id: '06405B2F-B746-4787-A6D8-2E70AE5E76BD',
                type: 'iPhone 12',
                name: 'iPhone 12-Detox',
            },
        },
        emulator: {
            type: 'android.emulator',
            device: {
                avdName: 'Pixel_3a_API_30_x86',
            },
        },
    },
    configurations: {
        ios: {
            device: 'simulator',
            app: 'ios',
        },
        android: {
            device: 'emulator',
            app: 'android',
        },
    },
};
