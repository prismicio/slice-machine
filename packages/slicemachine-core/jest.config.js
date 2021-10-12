/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
  collectCoverage: true,
  coverageDirectory: "coverage",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    "^.+\\.js$": "babel-jest",
  },
  transformIgnorePatterns: ["\\.pnp\\.[^\\/]+$"],
};
