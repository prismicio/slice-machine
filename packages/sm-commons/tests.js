const expect = require('expect.js')

function smConfig(config) {
  expect(config).to.have.property('libraryName')
  expect(config).to.have.property('gitUrl')
  expect(config).to.have.property('framework')
  expect(config).to.have.property('this-should-break')
  console.log('here E!')
}

module.exports = {
  smConfig
}