const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ["node_modules", "<rootDir>/"],
  clearMocks: true,
  collectCoverage: true,
  globals: { appRoot: ".." },
  moduleNameMapper: {
    "^@builders/(.*)$": "<rootDir>/lib/builders/$1",
    "^@components/(.*)$": "<rootDir>/components/$1",
    "^@lib/(.*)$": "<rootDir>/lib/$1",
    "^@models/(.*)$": "<rootDir>/lib/models/$1",
    "^@src/(.*)$": "<rootDir>/src/$1",
    "^@tests/(.*)$": "<rootDir>/tests/$1",
    "^@utils/(.*)$": "<rootDir>/lib/utils/$1",
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
