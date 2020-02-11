const fs = require('fs')
const expect = require('expect.js')

function pathExists(p, error) {
  try {
    if (fs.existsSync(p)) {
      throw new Error(error);
    }
  } catch (err) {
    consola.error(err);
  }
}

function smConfig(config) {
  expect(config).to.have.property('libraryName')
  expect(config).to.have.property('gitUrl')
  expect(config).to.have.property('framework')
}

module.exports = {
  pathExists,
  smConfig
};