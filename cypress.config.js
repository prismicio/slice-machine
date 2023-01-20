const { defineConfig } = require("cypress");

module.exports = defineConfig({
  env: {
    codeCoverage: {
      url: '/api/__coverage__',
    },
  },

  e2e: {
    baseUrl: 'http://localhost:9999/',
    supportFile: 'cypress/support/e2e.js',
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      require("./cypress/plugins/index.js")(on, config);
      return config;
    },
  },
});