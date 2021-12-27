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
        "max-classes-per-file": "off",
        "no-underscore-dangle": "off",
        "@typescript-eslint/naming-convention": [
          "error",
          {
            selector: "variable",
            format: ["camelCase", "PascalCase", "UPPER_CASE"],
            leadingUnderscore: "allow", // allows for throw away vars
          },
          {
            selector: "function",
            format: ["camelCase", "PascalCase"],
          },
          {
            selector: "typeLike",
            format: ["PascalCase"],
          },
        ],
        "react/function-component-definition": [
          "error",
          {
            namedComponents: "arrow-function",
            unnamedComponents: "arrow-function",
          },
        ],
        "react/jsx-props-no-spreading": "off",
        // allow explicitly not handling error
        "no-void": "off",

        // turn off temporarily until solution for req.body typing is figured out
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",

        // turn of temprorarily until AccessTokenPayload has its own properties
        "@typescript-eslint/no-empty-interface": "off",

        // turn off until logger gets implemented
        "no-console": "off",
      },
      overrides: [
        {
          files: ["**/__tests__/**"],
          rules: {
            // allow unbound methods for expectation calls in tests
            "@typescript-eslint/unbound-method": "off",
            "jest/unbound-method": "error",
            // allow for loops
            "no-restricted-syntax": "off",
            // allow awaits in loops
            "no-await-in-loop": "off",
          },
        },
      ],
    },
  ],
};
