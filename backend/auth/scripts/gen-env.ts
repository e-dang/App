import fs from "fs";
import * as yaml from "js-yaml";

type Config = Record<string, string | number | boolean>;

function readConfig(filepath: string) {
  return yaml.load(fs.readFileSync(filepath, {encoding: "utf-8"}).toString()) as Record<string, string>;
}

function yamlToEnv(config: Config) {
  let envString = "";
  for (const key of Object.keys(config)) {
    envString += `${key}=${String(config[key])}\n`;
  }

  return envString.trimEnd();
}

function writeEnvFile(filepath: string, data: Config) {
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
  fs.writeFileSync(filepath, yamlToEnv(data));
}

function writeDbEnv(rawConfig: Config) {
  const dbConfig: Config = {
    POSTGRES_PASSWORD: rawConfig.dbPassword,
    POSTGRES_USER: rawConfig.dbUser,
    POSTGRES_DB: rawConfig.dbName,
  };

  writeEnvFile(".env.db.dev", dbConfig);
}

function writeAppEnv(rawConfig: Config) {
  const appConfig: Config = {};

  for (const key of Object.keys(rawConfig)) {
    if (typeof rawConfig[key] === "string") {
      appConfig[key] = (rawConfig[key] as string).replace(/\n/g, "\\n"); // strings can only be on one line in env files
    } else {
      appConfig[key] = rawConfig[key];
    }
  }

  writeEnvFile(".env.app.dev", appConfig);
}

function generateDevEnv() {
  const rawConfig = readConfig(".env.dev.yaml");
  writeDbEnv(rawConfig);
  writeAppEnv(rawConfig);
}

generateDevEnv();
