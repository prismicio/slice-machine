const fs = require('fs')
const path = require('path')
const glob = require('glob')
const slash = require('slash')
const { shouldIRun } = require('../common')
const { getInfoFromPath } = require('sm-commons/methods/lib')
const { createPathToScreenshot } = require('../../lib/queries/screenshot')

main()

async function main() {
  console.info('\nSliceMachine nows supports both default and custom previews (screenshots)!')
  console.info('Default screenshots are now stored in a special .slicemachine folder.')
  const { yes } = await shouldIRun('Would you like me to move current previews to .slicemachine?')
  if (yes) {
    const cwd = require.main.paths[0].split('node_modules')[0]
    const pathToSmFile = cwd + 'sm.json'
    if (fs.existsSync(pathToSmFile, 'utf8')) {
      try {
        const json = JSON.parse(fs.readFileSync(pathToSmFile, 'utf-8'));
        (json.libraries || []).forEach((lib) => {
          const {
            isLocal,
            pathExists,
            pathToSlices,
          } = getInfoFromPath(lib, cwd)
          if (isLocal && pathExists) {
            const matches = glob.sync(`${slash(pathToSlices)}/**/preview.png`)
            matches.forEach((match) => {
              const split = match.split(path.posix.sep)
              const sliceName = split[split.length - 2]
              if (sliceName) {
                const pathToNewFile = createPathToScreenshot({ cwd, from: split[split.length - 3], sliceName })
                fs.mkdirSync(path.dirname(pathToNewFile), { recursive: true })
                fs.renameSync(match, pathToNewFile)
              }
            })
          }
        })
        fs.writeFileSync(pathToSmFile, JSON.stringify({ ...json, _latest: '0.0.40' }, null, 2))
        return console.info('Done. Read the full log at /changelog for more info!')
      } catch(e) {
        console.log(e)
      }
    }
    console.log('Could not find sm.json file. Exiting...')
  }
}
