module.exports = {
  clearMocks: true,
  // collectCoverage: true,
  globals: { appRoot: ".." },
  moduleNameMapper: {
    "^@builders/(.*)$": "<rootDir>/lib/builders/$1",
    "^@components/(.*)$": "<rootDir>/components/$1",
    "^@lib/(.*)$": "<rootDir>/lib/$1",
    "^@models/(.*)$": "<rootDir>/lib/models/$1",
    "^@src/(.*)$": "<rootDir>/src/$1",
    "^@tests/(.*)$": "<rootDir>/tests/$1",
    "^@utils/(.*)$": "<rootDir>/lib/utils/$1",
    "^components/(.*)$": "<rootDir>/components/$1",
    "^lib/(.*)$": "<rootDir>/lib/$1",
    "^tests/(.*)$": "<rootDir>/tests/$1",
  },
  setupFiles: ["<rootDir>/tests/jest-setup.js"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": [
      "babel-jest",
      {
        presets: ["next/babel"],
        plugins: ["@babel/plugin-proposal-private-methods"],
      },
    ],
  },
  transformIgnorePatterns: [
    "/node_modules/(?!connected-next-router/es)/",
    "/packages/client/",
    "/packages/core/",
  ],
};
