import {TimeoutError} from "./errors";

export const sleep = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export async function timeout(ms: number) {
  await sleep(ms);
  throw new TimeoutError();
}

export function logAsyncError(funcName: string, error: Error) {
  console.error(`${funcName} failed with error ${error.message}`);
}
