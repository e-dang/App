/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    testEnvironment: 'node',
    preset: 'react-native',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    globals: {
        'ts-jest': {
            tsConfig: {
                isolatedModules: false,
            },
        },
    },
    testRegex: '(/__tests__/.*(test|spec))\\.(ts|tsx|js)$',
    testPathIgnorePatterns: ['\\.snap$', 'e2e', '<rootDir>/node_modules/'],
    cacheDirectory: '.jest/cache',
    setupFiles: ['./setupJest.js'],
};
