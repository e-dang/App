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
      parserOptions: {
        project: `${__dirname}/tsconfig.json`,
      },
    },
  ],
};
