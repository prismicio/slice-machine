const baseConfig = require("./.eslintrc.json");

/**
 * This is here so that eslint can be run in this directory, with yarn lint.
 * the other .eslint.json file is for eslint when it is being run at the top level.
 */

const config = Object.assign({}, baseConfig, {
  parserOptions: Object.assign({}, baseConfig.parserOptions, {
    tsconfigRootDir: "./",
  }),
});

module.exports = config;
