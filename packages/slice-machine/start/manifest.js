const fs = require('fs')
const path = require('path')
const prompts = require('prompts')

async function createManifest(cwd) {
  const response = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: 'Can I create a manifest file for you?',
    initial: true
  })

  if (!response.confirm) {
    console.log('Please create an sm.json file at the root of your project')
    return true
  }

  const pathToSmFile = path.join(cwd, 'sm.json')
  fs.writeFileSync(
    pathToSmFile,
    JSON.stringify({
      apiEndpoint: "https://update-me.prismic.io/api/v2",
      libraries: ["~/slices"]
    }, null, 2)
  )

  console.log('File created!\nYou\'ll need to update it with a valid Prismic API endpoint!')
  return true
}

module.exports = {
  createManifest
}