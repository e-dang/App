/* eslint-disable no-console */
import {randomUUID} from "crypto";
import fs from "fs";
import {load} from "js-yaml";
import path from "path";
import {createToken} from "../__tests__/integration/utils";

function parseDevPrivateKey() {
  const rawConfigs = load(
    fs.readFileSync(path.join(__dirname, "..", ".env.dev.yaml"), {encoding: "utf-8"}).toString(),
  ) as Record<string, string>;
  return rawConfigs.accessTokenPrivateKey;
}

async function createUserAccessToken() {
  process.env.accessTokenPrivateKey = parseDevPrivateKey();
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
