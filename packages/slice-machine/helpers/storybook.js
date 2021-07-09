/** Called from user project */

const path = require('path')
const glob = require('glob')

const getStoriesPaths = () => {
  return [
    path.normalize(`${process.cwd()}/.slicemachine/assets/**/*.stories.js`),
    path.normalize(`${process.cwd()}/customtypes/**/*.stories.js`)
  ].filter(e => glob.sync(e).length)
}

module.exports = {
  getStoriesPaths
}