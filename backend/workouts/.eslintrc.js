const jestPackage = require("jest/package.json");

module.exports = {
  root: true,
  extends: ["edang"],
  settings: {
    jest: {
      version: jestPackage.version,
    },
  },
  parserOptions: {
    project: "tsconfig.json",
  },
};
