/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const {pathsToModuleNameMapper} = require('ts-jest/utils');
const {compilerOptions} = require('./tsconfig');
const path = require('path');

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./__tests__/integration/setup.ts'],
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {prefix: path.resolve(__dirname)}),
    testTimeout: process.env.CI ? 30000 : 10000,
    globalSetup: './__tests__/integration/globalSetup.ts',
    runner: 'groups',
};
