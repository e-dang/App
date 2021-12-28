/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const {pathsToModuleNameMapper} = require("ts-jest");
const JSON5 = require("json5");
const path = require("path");
const fs = require("fs");

const tsconfig = JSON5.parse(fs.readFileSync(path.resolve("./tsconfig.json")));

module.exports = {
  maxWorkers: 1,
  preset: "ts-jest",
  testEnvironment: "node",
  testTimeout: 120000,
  moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths, {prefix: path.resolve(__dirname)}),
  testRegex: "__tests__/e2e/.*\\.e2e\\.ts$",
  setupFilesAfterEnv: ["./__tests__/e2e/setup.ts"],
};
