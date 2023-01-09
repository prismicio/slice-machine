const path = require("node:path");

/**
 * @type {import("puppeteer").Configuration}
 */
const config = {
  // Changes the cache location for Puppeteer.
  cacheDirectory: path.join(__dirname, ".cache", "puppeteer"),
};

module.exports = config;
