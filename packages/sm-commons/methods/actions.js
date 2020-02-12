const fs = require('fs')
const path = require('path')
const consola = require('consola')
const validateNpmPackage = require('validate-npm-package')

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

function readJsonPackage(p) {
  try {
    const package = tests.isJSON(
      tests.pathExists(
        p,
        `package.json was not found. Did you run bundle from root of your repository? Path: ${p}`,
        true
      )
    );

    const r = validateNpmPackage(package)
    // prevents a possible... bug with field... 'bugs' of package.json
    if (r.errors.filter(e => e.indexOf('bugs') === -1).length) {
      throw r.errors
    }
    return {
      package,
      packageName: package.name
    }
  } catch(e) {
    consola.error("[slice-machine/readJsonPackage] Error while parsing package.json");
    if (Array.isArray(e)) {
      consola.error('These errors were generated: ')
      e.forEach((err) => console.log(`- ${err}`))
      throw new Error()
    }
    consola.error(e);
    throw new Error()
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
  readJsonPackage,
  writeSmFile
};