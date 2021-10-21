const path = require('path')
const { libraries, FileSystem } = require('slicemachine-core')

const cwd = path.join(__dirname, '../../slice-machine/tests/project')
const manifest = FileSystem.Manifest.retrieveManifest(cwd).content

;(async () => {
  console.log(await libraries(cwd, manifest.libraries))
})()