/** Called from user project */
const glob = require("glob");

/**
 * @deprecated This function will be removed in future releases, if you need it, copy/paste the following code inside your project.
 */
const getStoriesPaths = () => {
  return [
    ".slicemachine/assets/**/*.stories.@(js|jsx|ts|tsx|svelte)",
    "customtypes/**/*.stories.@(js|jsx|ts|tsx|svelte)",
  ].reduce((acc, p) => (glob.sync(p).length ? [...acc, `../${p}`] : acc), []);
};

module.exports = {
  getStoriesPaths,
};
