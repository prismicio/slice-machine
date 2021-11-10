module.exports = {
  globals: {
    appRoot: "..",
  },
  moduleNameMapper: {
    "^lib(.*)$": "<rootDir>/lib$1",
    "^src(.*)$": "<rootDir>/src$1",
    "^components(.*)$": "<rootDir>/components$1",
  },
  transform: {
    "\\.(js|ts|jsx|tsx)$": [
      "babel-jest",
      { configFile: "./babel.next.config.js" },
    ],
  },
  coverageThreshold: {
    "./lib/widgets": {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  testPathIgnorePatterns: ["node_modules", "cypress"],
};
