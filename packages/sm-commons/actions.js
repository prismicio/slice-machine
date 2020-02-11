const fs = require('fs')
const consola = require("consola")
const tests = require('./tests')

function readSmConfig(path) {
  try {
    const file = JSON.parse(fs.readFileSync(path))
    tests.smConfig(file)
    return file
  } catch(e) {
    consola.error('[slice-machine/readSmConfig] Error while reading config.')
    consola.error(e)
  }

}

module.exports = {
  readSmConfig
}