const fs = require('fs')
const path = require('path')
const consola = require('consola')
const deepmerge = require('deepmerge')

const { SM_FILE } = require('../consts')

function getFilePath(p) {
  const startPath = p || process.cwd()
  const pathToSmFile = path.join(startPath, SM_FILE)
  const exists = fs.existsSync(pathToSmFile)
  return {
    pathToSmFile,
    exists
  }
}

function get(p) {
  const { pathToSmFile, exists } = getFilePath(p)
  if (!exists) {
    return consola.error('Could not find sm file')
  }
  try {
    const sm = JSON.parse(fs.readFileSync(pathToSmFile))
    return sm
  } catch(e) {
    consola.error(`Could not parse "${SM_FILE}" file`)
    return {}
  }
}

function write(data, p) {
  try {
    const { pathToSmFile } = getFilePath(p)
    fs.writeFileSync(pathToSmFile, JSON.stringify(data))
  } catch(e) {
    return consola.error(`Could not write "${SM_FILE}" file`)
  }
}

function patch(data, invert = false, p) {
  try {
    const sm = get(p)
    const args = invert ? [data, sm] : [sm, data]
    const merge = deepmerge(...args)
    console.log({
      sm,
      data,
      merge
    })
    write(merge, p)
  } catch (e) {
    return consola.error(`Could not patch "${SM_FILE}" file`)
  }
}

module.exports = {
  get,
  write,
  patch
}
