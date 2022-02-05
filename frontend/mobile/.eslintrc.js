const jestPackage = require("jest/package.json");

module.exports = {
  settings: {
    jest: {
      version: jestPackage.version,
    },
  },
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      plugins: ["react-native"],
      env: {
        "react-native/react-native": true,
      },
      parserOptions: {
        project: `${__dirname}/tsconfig.json`,
      },
      rules: {
        "react-native/no-unused-styles": "warn",
        "react-native/split-platform-components": "error",
        "react-native/no-inline-styles": "warn",
        "react-native/no-color-literals": "warn",
        // creates ugly code - just assign defaults in destructured props
        "react/require-default-props": "off",
        // how are you supposed to add inline icon props with this on?
        "react/no-unstable-nested-components": "off",
        // allow use of immer library from rtkquery
        "no-param-reassign": [1, {props: true, ignorePropertyModificationsFor: ["state"]}],
      },
    },
  ],
};
