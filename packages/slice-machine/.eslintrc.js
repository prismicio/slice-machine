module.exports = {
  settings: {
    "import/resolver": {
      typescript: {},
    },
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: [
      "../../tsconfig-node.json",
      "./scripts/tsconfig.json",
      "./server/tsconfig.json",
      "./tsconfig.json",
    ],
    tsconfigRootDir: __dirname,
  },
  plugins: ["@typescript-eslint", "import", "jest"],
  extends: [
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:jest/recommended",
    "eslint-config-prettier",
  ],
  ignorePatterns: ["build", "templates", "**/tests/**", "helpers/**"],
  rules: {
    "@typescript-eslint/prefer-nullish-coalescing": "warn",
    "@typescript-eslint/strict-boolean-expressions": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { "varsIgnorePattern": "^_" }],
  },
};
