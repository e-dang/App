import * as jose from "jose";
import fs from "fs";
import path from "path";

export interface PartialConfigs {
  [x: string]: string;
}

function sourceConfigs() {
  const secrets: PartialConfigs = {};

  fs.readdirSync(path.join(__dirname, "secrets"), {encoding: "utf-8"}).forEach((file) => {
    const fileStats = fs.lstatSync(path.join(__dirname, "secrets", file));
    if ((fileStats.isFile() || fileStats.isSymbolicLink()) && file.substr(0, 2) !== "..") {
      if (file in process.env) {
        // use environment variable override
        secrets[file] = process.env[file];
      } else {
        // read mounted configs
        secrets[file] = fs.readFileSync(path.join(__dirname, "secrets", file), {encoding: "utf-8"}).toString();
      }
    }
  });

  return secrets;
}

const accessTokenAlg = "EdDSA";
const sourcedConfigs = sourceConfigs();

interface Config {
  env: string;
  dbHost: string;
  dbPort: number;
  dbUser: string;
  dbPassword: string;
  dbName: string;
  passwordHasher: string;
  passwordIterations: number;
  jwtAccessTokenExp: string;
  jwtRefreshTokenExp: string;
  passwordResetTokenAlg: string;
  passwordResetTokenSecret: string;
  passwordResetTokenExp: number;
  emailHost: string;
  emailPort: number;
  emailUser?: string;
  emailPassword?: string;
  refreshTokenPrivateKey: Uint8Array;
  accessTokenPrivateKey: Promise<jose.KeyLike>;
  accessTokenPublicKey: Promise<jose.KeyLike>;
  accessTokenAlg: string;
  refreshTokenAlg: string;
  jwtIssuer: string;
  jwtAudience: string;
  httpPort: number;
  apiVersion: string;
  allowedHosts: string;
  client: string;
}

export const config: Config = {
  env: process.env.NODE_ENV,
  dbHost: sourcedConfigs.dbHost,
  dbPort: parseInt(sourcedConfigs.dbPort, 10),
  dbUser: sourcedConfigs.dbUser,
  dbPassword: sourcedConfigs.dbPassword,
  dbName: sourcedConfigs.dbName,
  passwordHasher: sourcedConfigs.passwordHasher,
  passwordIterations: parseInt(sourcedConfigs.passwordIters, 10),
  jwtAccessTokenExp: sourcedConfigs.accessTokenExp,
  jwtRefreshTokenExp: sourcedConfigs.refreshTokenExp,
  passwordResetTokenAlg: sourcedConfigs.passwordResetTokenAlg,
  passwordResetTokenSecret: sourcedConfigs.passwordResetTokenSecret,
  passwordResetTokenExp: parseInt(sourcedConfigs.passwordResetTokenExp, 10),
  emailHost: sourcedConfigs.emailHost,
  emailPort: parseInt(sourcedConfigs.emailPort, 10),
  emailUser: sourcedConfigs?.emailUser,
  emailPassword: sourcedConfigs?.emailPassword,
  refreshTokenPrivateKey: new TextEncoder().encode(sourcedConfigs.refreshTokenSecret),
  accessTokenPrivateKey: jose.importPKCS8(sourcedConfigs.accessTokenPrivate, accessTokenAlg),
  accessTokenPublicKey: jose.importSPKI(sourcedConfigs.accessTokenPublic, accessTokenAlg),
  accessTokenAlg,
  refreshTokenAlg: "HS512",
  jwtIssuer: "dev.erickdang.com",
  jwtAudience: "dev.erickdang.com",
  httpPort: parseInt(sourcedConfigs.httpPort, 10),
  apiVersion: "v1",
  allowedHosts: "https://dev.erickdang.com",
  client: sourcedConfigs.client,
};
