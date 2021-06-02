const path = require('path')
const { default: Files } = require('../../../build/lib/utils/files');

module.exports = {
  version: '0.1.0',
  main: async function main(_, { cwd }) {
    const pathToOldMocks = path.join(cwd, '.slicemachine', 'mocks.json')
    if (Files.exists(pathToOldMocks)) {
      Files.remove(pathToOldMocks)
    }
  }
}
