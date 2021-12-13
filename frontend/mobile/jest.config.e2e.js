module.exports = {
    maxWorkers: 1,
    preset: 'ts-jest',
    testEnvironment: 'node',
    testTimeout: 120000,
    testRegex: '__tests__/e2e/.*\\.e2e\\.ts$',
    setupFilesAfterEnv: ['./__tests__/e2e/setup.ts'],
};
