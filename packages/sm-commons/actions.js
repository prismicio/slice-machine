const fs = require('fs')

const tests = require('./tests')

export const readSmConfig = (path) => {
  try {
    const file = JSON.parse(fs.readFileSync(path))
    tests.smConfig(file)
  } catch(e) {
    console.error('[slice-machine/readSmConfig] Error while reading config.')
    console.error(e)
  }

}