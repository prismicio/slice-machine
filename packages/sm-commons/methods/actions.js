const fs = require('fs')
const path = require('path')
const consola = require('consola')
const tests = require('./tests')
const misc = require('./misc')

function pathToLib(config) {
  const p = path.join(process.cwd(), config.pathToLibrary || './');
  tests.pathHasType(p, 'file', `Given path to library "${p}" does not exist`)
  return p
}

function pathToSlices(config, toLib) {
  const p = path.join(toLib, config.slicesFolder || "slices");
  tests.pathHasType(
    p,
    'directory',
    `Given path to slices folder "${p}" does not exist`
  );
  return p
}

function readConfig(p) {
  try {
    const file = JSON.parse(fs.readFileSync(p))
    tests.smConfig(file)
    return file
  } catch(e) {
    consola.error('[slice-machine/readConfig] Error while reading config.')
    consola.error(e)
  }
}

function fetchSliceDefinitions(p) {
  try {

    const folders = misc.getDirectories(p)

    if (!folders.length) {
      throw new Error('[Reason] Slices folder is empty.')
    }

    const slices = []
    folders.forEach((p) => {
      tests.isSliceFolder(p)
      const model = JSON.parse(misc.readFile(path.join(p, 'model.json')))
      slices.push(model)
    })

    return slices

  } catch (e) {
    consola.error(
      "[slice-machine/fetchSliceDefinitions] Error while fetching slices."
    );
    consola.error(e);
  }
}

function writeSmFile(slices) {
  try {
    fs.writeFileSync(path.join(process.cwd(), 'sm.json'), slices)
  } catch (e) {
    throw new Error(`[SliceMachine/writeFile] An unexpected error occured while write file "sm.json" to ${process.cwd()}`)
  }
}

module.exports = {
  fetchSliceDefinitions,
  pathToLib,
  pathToSlices,
  readConfig,
  writeSmFile
};