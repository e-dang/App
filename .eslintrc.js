module.exports = {
  root: true,
  extends: ["airbnb", "eslint:recommended", "plugin:promise/recommended", "plugin:prettier/recommended"],
  rules: {
    // check for dependencies in devDependencies as well
    "import/no-extraneous-dependencies": ["error", {devDependencies: true}],
  },
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      extends: [
        "airbnb-typescript",
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:jest/recommended",
        "plugin:promise/recommended",
        "plugin:prettier/recommended",
      ],
      parser: "@typescript-eslint/parser",
      env: {
        es2021: true,
        node: true,
        jest: true,
      },
      parserOptions: {
        ecmaVersion: 13,
        sourceType: "module",
      },
      rules: {
        // default exports are annoying
        "import/prefer-default-export": "off",
        // use _ to indicate throw away variables and args
        "@typescript-eslint/no-unused-vars": [
          "error",
          {varsIgnorePattern: "^_", argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_"},
        ],
        // makes verbose ugly code when using async/await
        "@typescript-eslint/no-misused-promises": [
          "error",
          {
            checksVoidReturn: false,
          },
        ],
        "no-plusplus": "off",
      },
    },
  ],
};
