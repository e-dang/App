/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const {pathsToModuleNameMapper} = require('ts-jest/utils');
const {compilerOptions} = require('./tsconfig');
const path = require('path');

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./tests/unit/setup.ts'],
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {prefix: path.resolve(__dirname)}),
    testTimeout: 10000,
    runner: 'groups',
};
