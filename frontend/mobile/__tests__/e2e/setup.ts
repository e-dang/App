import {cleanup, init, device} from "detox";

beforeAll(async () => {
  await init(undefined, {initGlobals: false});
  await device.launchApp({newInstance: true});
});

afterAll(async () => {
  await cleanup();
});
