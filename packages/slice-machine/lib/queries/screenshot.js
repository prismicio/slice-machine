const fs = require('fs')
const path = require('path')
const glob = require('glob')

const { acceptedImagesTypes } = require('../consts')

function createPathToScreenshot({ cwd, from, sliceName }) {
  return path.join(cwd, '.slicemachine/assets', from, sliceName, 'preview.png')
}

function getPathToScreenshot({ cwd, from, sliceName }) {
  const slicePath = path.join(cwd, from, sliceName)
  const exists = glob.sync(`${slicePath}/preview.@(${acceptedImagesTypes.join('|')})`)
  if (exists.length) {
    return {
      exists: true,
      path: exists[0],
      isCustom: true
    }
  }
  const defaultPath = createPathToScreenshot({ cwd, from, sliceName })
  return {
    exists: false,
    path: fs.existsSync(defaultPath) ? defaultPath : null,
    defaultPath,
    isCustom: false
  }
}

module.exports = {
  createPathToScreenshot,
  getPathToScreenshot
}