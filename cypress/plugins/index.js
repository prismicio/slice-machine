/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
const fs = require("fs");
const os = require("os");
const path = require("path");
/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on("task", {
    rmrf(file) {
      return fs.promises
        .rm(file, { recursive: true, force: true })
        .then(() => null);
    },
    clearDir(dir) {
      if (fs.existsSync(dir)) {
        return fs.promises
          .rmdir(dir, { recursive: true })
          .then(() => fs.promises.mkdir(dir))
          .then(() => null);
      } else {
        return null;
      }
    },
  });
};
