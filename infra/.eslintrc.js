module.exports = {
  root: true,
  extends: ["edang"],
  settings: {
    jest: {
      version: 27, // just so eslint doesnt complain
    },
  },
  parserOptions: {
    project: `${__dirname}/tsconfig.json`,
  },
  rules: {
    "no-new": "off", // resources aren't always assigned to variables in IaC
  },
};
