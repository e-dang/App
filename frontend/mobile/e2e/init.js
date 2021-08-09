import detox, {device} from 'detox';

beforeAll(async () => {
    await device.launchApp({
        newInstance: true,
    });
});
