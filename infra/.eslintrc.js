module.exports = {
  settings: {
    jest: {
      version: 27, // just so eslint doesnt complain
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
