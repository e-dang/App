const jestPackage = require("jest/package.json");

module.exports = {
  root: true,
  extends: ["edang", "edang-react"],
  settings: {
    jest: {
      version: jestPackage.version,
    },
  },
  parserOptions: {
    project: `${__dirname}/tsconfig.json`,
  },
  env: {
    "react-native/react-native": true,
  },
  plugins: ["react-native"],
  rules: {
    "no-param-reassign": [1, {props: true, ignorePropertyModificationsFor: ["state"]}],
  },
};
