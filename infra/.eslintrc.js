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
      rules: {
        "@typescript-eslint/no-unused-vars": ["error", {varsIgnorePattern: "^_"}], // should set resource to variable in pulumi code
        "@typescript-eslint/naming-convention": [
          "error",
          {
            leadingUnderscore: "allow", // allows for throw away vars
          },
        ],
      },
    },
  ],
};
