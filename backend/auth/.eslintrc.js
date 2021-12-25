const jestPackage = require('jest/package.json');

module.exports = {
  settings: {
    jest: {
      version: jestPackage.version,
    },
  },
  parserOptions: {
    project: `${__dirname}/tsconfig.eslint.json`,
  },
};
