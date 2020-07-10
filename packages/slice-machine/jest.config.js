const { defaults } = require('jest-config');

module.exports = {
  ...defaults,
  verbose: true,
  coverageThreshold: {
    './lib/widgets': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  }
};