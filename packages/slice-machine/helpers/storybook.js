/** Called from user project */
const glob = require("glob");

const getStoriesPaths = () => {
  return [
    ".slicemachine/assets/**/*.stories.@(js|jsx|ts|tsx|svelte)",
    "customtypes/**/*.stories.@(js|jsx|ts|tsx|svelte)",
  ].reduce((acc, p) => (glob.sync(p).length ? [...acc, `../${p}`] : acc), []);
};

module.exports = {
  getStoriesPaths,
};
