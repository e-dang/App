module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    [
      "module-resolver",
      {
        root: ["."],
        extensions: [".ios.js", ".android.js", ".js", ".ts", ".tsx", ".json"],
        alias: {
          "@src": "./src",
          "@tests": "./__tests__/",
          "@api": "./src/api",
          "@screens": "./src/screens",
          "@utils": "./src/utils",
          "@i18n": "./src/i18n",
          "@components": "./src/components",
          "@styles": "./src/styles",
          "@store": "./src/store",
          "@hooks": "./src/hooks",
          "@selectors": "./src/selectors",
          "@entities": "./src/entites",
        },
      },
    ],
  ],
};
