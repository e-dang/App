import {timeout} from "@src/utils/async";
import {TimeoutError} from "@src/utils/errors";

describe("async utils", () => {
  test("timeout throws TimeoutError after specified timeout", async () => {
    await expect(() => timeout(1)).rejects.toThrowError(new TimeoutError().message);
  });
});
