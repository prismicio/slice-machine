/** Called from user project */
const glob = require('glob')

const getStoriesPaths = () => {
  return [
    `${process.cwd()}/.slicemachine/assets/slices/*/*.stories.js`,
    `${process.cwd()}/customtypes/**/*.stories.js`
  ].filter(e => glob.sync(e).length)
}

module.exports = {
  getStoriesPaths
}