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
      "./__tests__/tsconfig.json",
      "./tsconfig.json",
    ],
    tsconfigRootDir: __dirname,
  },
  plugins: ["@typescript-eslint", "import", "jest"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:jest/recommended",
    "eslint-config-prettier",
  ],
  ignorePatterns: ["build"],
  rules: {
    "jest/no-mocks-import": "off",
    "jest/no-conditional-expect": "off",
  },
};
