const fs = require('fs')
const path = require('path')
const prompts = require('prompts')

main()

function handleChangelog() {
  try {
    const { version } = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'))
    const pathToScript = path.join(__dirname, 'changelog/versions', version.split('-')[0], 'index.js')
    if (fs.existsSync(pathToScript)) {
      require(pathToScript)
    }
  } catch(e) {
    return
  }
}

async function main() {
  const pathToPkg = require.main.paths[0].split('node_modules')[0] + 'package.json'
  if (fs.existsSync(pathToPkg)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pathToPkg, 'utf-8'))
      if (!pkg.scripts) {
        pkg.scripts = {};
      }
      if (!pkg.scripts.slicemachine) {
        pkg.scripts.slicemachine = "start-slicemachine --port 9999"
        const { yes } = await prompts({
          type: 'select',
          name: 'yes',
          message: 'Add a "slicemachine" script to package.json?',
          choices: [
            { title: 'Yes', value: true },
            { title: 'No (skip)', value: false },
          ],
          initial: 0
        })
        if (yes) {
          fs.writeFileSync(pathToPkg, JSON.stringify(pkg, null, 2))
          console.log('Added script "slicemachine" to package.json')
        }
      }
    } catch(e) {
      console.error('Could not parse file at ' + pathToPkg)
    }
  }
  handleChangelog()
}
