module.exports = {
  root: true,
  extends: ['airbnb', 'eslint:recommended', 'plugin:promise/recommended', 'plugin:prettier/recommended'],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: [
        'airbnb-typescript',
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:jest/recommended',
        'plugin:promise/recommended',
        'plugin:prettier/recommended',
      ],
      parser: '@typescript-eslint/parser',
      env: {
        es2021: true,
        node: true,
        jest: true,
      },
      parserOptions: {
        ecmaVersion: 13,
        sourceType: 'module',
      },
      rules: {
        'import/prefer-default-export': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {varsIgnorePattern: '^_', argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_'},
        ],
        '@typescript-eslint/no-misused-promises': [
          'error',
          {
            checksVoidReturn: false,
          },
        ],
      },
    },
  ],
};
