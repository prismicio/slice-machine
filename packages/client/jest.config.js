/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
  clearMocks: true,
  collectCoverage: true,
  preset: "ts-jest",
  testEnvironment: "node",
  coverageDirectory: "coverage",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  transformIgnorePatterns: ["/node_modules/", "\\.pnp\\.[^\\/]+$"],
  testPathIgnorePatterns: ["node_modules", "__tests__/__stubs__"],
};
