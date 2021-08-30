const dedent = require('dedent')
const boxen = require('boxen')

function infoBox(npmCompare, localhost) {
  if (!npmCompare) {
    return
  }

  const hasUpdate = npmCompare.updateAvailable && npmCompare.onlinePackage
  if (!npmCompare.err) {
    const currentVersion = npmCompare && npmCompare.currentVersion ? npmCompare.currentVersion : ''
    console.log(
      boxen(
        dedent(`🍕 Slicemachine ${currentVersion.split('-')[0]} started.
          ${hasUpdate && npmCompare.onlinePackage ? `
            A new version (${npmCompare.onlinePackage.version}) is available!
            Upgrade now: yarn add slice-machine-ui@latest
          ` : ''}
          Running on:        ${localhost}
        👇 Server logs will appear right here
        `), {
          padding: 1,
          borderColor: hasUpdate ? 'red' : 'green'
        }
      )
    )
  } else {
    console.error('Could not fetch package versions. Are you connected to internet?')
  }
}

module.exports = infoBox