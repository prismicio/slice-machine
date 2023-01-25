const { defineConfig } = require("cypress");

const SERVER_PORT = process.env.SERVER_PORT;

module.exports = defineConfig({
  viewportWidth: 1920,
  viewportHeight: 1080,
  defaultCommandTimeout: 10000,
  retries: 1,
  video: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    },
    baseUrl: `http://localhost:${SERVER_PORT}`,
  },
});
