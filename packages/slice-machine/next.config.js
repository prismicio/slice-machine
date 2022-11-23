/* eslint @typescript-eslint/no-var-requires: "off" */
const path = require("path");

module.exports = {
  distDir: "build/client",
  env: {
    // overridden by start script
    CWD: path.resolve("tests/project"),
  },
};
