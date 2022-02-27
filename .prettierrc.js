module.exports = {
  bracketSpacing: false,
  bracketSameLine: false,
  singleQuote: false,
  trailingComma: "all",
  arrowParens: "always",
  embeddedLanguageFormatting: "auto",
  htmlWhitespaceSensitivity: "css",
  insertPragma: false,
  printWidth: 120,
  proseWrap: "preserve",
  quoteProps: "as-needed",
  requirePragma: false,
  semi: true,
  tabWidth: 2,
  useTabs: false,
  overrides: [
    {
      files: ["*.yaml", "*.yml"],
      options: {
        proseWrap: "always",
      },
    },
  ],
};
