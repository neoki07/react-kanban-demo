module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:import/recommended",
    "plugin:jest/recommended",
    "plugin:jest-dom/recommended",
    "plugin:testing-library/react",
    "prettier",
  ],
  parserOptions: {
    sourceType: "module",
  },
  plugins: ["unused-imports"],
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "no-var": "error",
    "import/no-unresolved": [2, { ignore: ["^src"] }],
    "no-unused-vars": "off",
    "import/order": [
      "warn",
      {
        "newlines-between": "always",
        pathGroupsExcludedImportTypes: ["builtin"],
        alphabetize: { order: "asc", caseInsensitive: true },
        pathGroups: [
          { pattern: "src/**", group: "internal", position: "before" },
        ],
      },
    ],
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
