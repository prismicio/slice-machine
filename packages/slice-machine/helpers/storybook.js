/** Called from user project */
const glob = require('glob')

const getStoriesPaths = () => {
  return [
    '.slicemachine/assets/**/*.stories.js',
    'customtypes/**/*.stories.js',
  ].reduce((acc, p) => glob.sync(p).length ? [...acc, `../${p}`] : acc, [])
}

module.exports = {
  getStoriesPaths
}