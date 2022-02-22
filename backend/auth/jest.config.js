/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const {pathsToModuleNameMapper} = require("ts-jest");
const path = require("path");
const {compilerOptions} = require("./tsconfig.json");

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {prefix: path.resolve(__dirname)}),
  testTimeout: 10000,
  testRegex: ".spec.ts$",
  cacheDirectory: "./.jest",
};
