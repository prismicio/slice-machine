const fs = require('fs')
const path = require('path')

main()

function writeLatest(pathToSmFile, version) {
  try {
    const json = JSON.parse(fs.readFileSync(pathToSmFile, 'utf-8'))
    fs.writeFileSync(pathToSmFile, JSON.stringify({ ...json, _latest: version }, null, 2))
  } catch(e) {
    console.log('[postinstall] Could not write sm.json file. Exiting...')
  }
}

function main() {
  const cwd = require.main.paths[0].split('node_modules')[0]
  const pathToPkg = cwd + 'package.json'
  const pathToSmFile = cwd + 'sm.json'
  if (fs.existsSync(pathToPkg) && fs.existsSync(pathToSmFile)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pathToPkg, 'utf-8'))
      if (!pkg.scripts) {
        pkg.scripts = {};
      }
      if (!pkg.scripts.slicemachine) {
        pkg.scripts.slicemachine = "start-slicemachine --port 9999"
        fs.writeFileSync(pathToPkg, JSON.stringify(pkg, null, 2))
        console.log('Added script "slicemachine" to package.json')
      }
      const { version } = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'))
      const cleanVersion = version.split('-')[0]
      writeLatest(pathToSmFile, cleanVersion)
    } catch(e) {
      console.error('Could not parse file at ' + pathToPkg)
      console.error(`Full error: ${e}`)
    }
    return
  }
  console.error('Missing file package.json or sm.json')
}
