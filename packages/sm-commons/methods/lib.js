const fs = require('fs')
const path = require('path')

const { SM_CONFIG_FILE } = require('../consts')

/** from relative path */
function getInfoFromPath(libPath, startPath) {
  const isLocal = ['@/', '~', '/'].find((e) => libPath.indexOf(e) === 0) !== undefined
  const pathToLib = path.join(
    startPath || process.cwd(),
    isLocal ? '' : 'node_modules',
    isLocal ? libPath.substring(1, libPath.length) : libPath,
  )
  const pathToConfig = path.join(pathToLib, SM_CONFIG_FILE)
  const pathExists = fs.existsSync(pathToLib)

  let config = {}
  if (fs.existsSync(pathToConfig)) {
    config = JSON.parse(fs.readFileSync(pathToConfig))
  }
  const pathToSlices = path.join(
    pathToLib,
    config.pathToLibrary || '.',
    config.slicesFolder || (isLocal ? '.' : 'slices')
  )
  return {
    config,
    isLocal,
    pathExists,
    pathToLib,
    pathToSlices,
  }
}

module.exports = {
  getInfoFromPath
}