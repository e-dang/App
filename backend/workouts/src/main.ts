import {bootstrap} from "./app.setup";

bootstrap().catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.log("Error starting application.\n", err);
});
