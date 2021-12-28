/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const {pathsToModuleNameMapper} = require("ts-jest/utils");
const path = require("path");
const {compilerOptions} = require("./tsconfig.json");

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["./__tests__/integration/setup.ts"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {prefix: path.resolve(__dirname)}),
  testTimeout: process.env.CI ? 30000 : 10000,
  runner: "groups",
};
