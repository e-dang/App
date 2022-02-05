/* eslint-disable no-console */
import {randomUUID} from "crypto";
import {createToken} from "../__tests__/integration/utils";

// fix formatting of new lines from env vars
process.env.accessTokenPrivateKey = process.env.accessTokenPrivateKey.replace(/\\n/g, "\n");

async function createUserAccessToken() {
  const userId = randomUUID();
  const token = await createToken({userId, role: "user"}, "1d");
  console.log();
  console.log("User ID:   ", userId);
  console.log("Access Token:   ", token, "\n");
}

createUserAccessToken().catch((err) => console.log(err));

// function createAdminAccessToken() {
//   return createAccessToken({id: randomUUID(), role: "admin"});
// }
// void createAdminAccessToken();
