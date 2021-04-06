const fs = require('fs')
const path = require('path')
const glob = require('glob')
const slash = require('slash')
const { shouldIRun } = require('../../common')
const { getInfoFromPath } = require('../../../build/lib/utils/lib')

module.exports = {
  test: function test({ cwd }) {
    const smFolder = path.join(cwd, '.slicemachine')
    return !(fs.existsSync(smFolder))
  },
  main: async function main(ignorePrompt, { cwd, pathToSmFile }) {
    const { yes } = ignorePrompt ? { yes: true } : await (async () => {
      console.info('\nSliceMachine nows supports both default and custom previews (screenshots)!')
      console.info('Default screenshots are now stored in a special .slicemachine folder.')
      return shouldIRun('Would you like me to move current previews to .slicemachine folder?')
    })()
    if (yes) {
      if (fs.existsSync(pathToSmFile, 'utf8')) {
        try {
          fs.mkdirSync(path.join(cwd, '.slicemachine', 'assets'), { recursive: true })
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
                  const pathToNewFile = path.join(cwd, '.slicemachine/assets', split[split.length - 3], sliceName, 'preview.png')
                  fs.mkdirSync(path.dirname(pathToNewFile), { recursive: true })
                  fs.renameSync(match, pathToNewFile)
                }
              })
            }
          })
        } catch(e) {
          console.log(e)
        }
      }
    }
  }
}
