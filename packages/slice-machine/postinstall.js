const { json } = require('body-parser')
const fs = require('fs')

main()

function main() {
  const pathToPkg = require.main.paths[0].split('node_modules')[0] + 'package.json'
  const pathExists = fs.existsSync(pathToPkg)
  console.log(pathExists)
  if (fs.existsSync(pathToPkg)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pathToPkg, 'utf-8'))
      if (!pkg.scripts) {
        pkg.scripts = {};
      }
      pkg.scripts['slicemachine'] = "start-slicemachine --port 9999"
      fs.writeFileSync(pathToPkg, JSON.stringify(pkg, null, 2))
      console.log('Added script "SliceMachine" to ' + pathToPkg)
    } catch(e) {
      console.error('Could not parse file at ' + pathToPkg)
    }
  }
}
