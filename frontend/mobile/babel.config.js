module.exports = {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
        [
            'module-resolver',
            {
                root: ['.'],
                extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
                alias: {
                    '@src': './src',
                    '@tests': './__tests__/',
                    '@api': './src/api',
                    '@screens': './src/screens',
                    '@utils': './src/utils',
                    '@sagas': './src/sagas',
                    '@reducers': './src/reducers',
                    '@actions': './src/actions',
                    '@constants': './src/constants',
                    '@i18n': './src/i18n',
                    '@components': './src/components',
                    '@styles': './src/styles',
                },
            },
        ],
    ],
};
