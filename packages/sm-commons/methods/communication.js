const fetch = require('node-fetch')
const semver = require('semver')

function handleUrl(endpoint, params) {
  const url = new URL(endpoint);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.set(key, value)
  )
  return url
}

async function handleFetch(endpoint, params = {}) {
  const url = handleUrl(endpoint, params)
  const response = await fetch(url.href)
  return response
}

function createCommunication({ apiEndpoint }) {
  return {
    versionIsValid: async function() {
      const package = require('../package.json')
      const response = await handleFetch(apiEndpoint.concat('/version'));
      const data = await response.json();

      if (!package || !package.version) {
        consola.error(`Could not find version property in "package.json"`)
        throw new Error()
      }
      if (!data || !data.current) {
        consola.error(`Unexpected error occured while fetching our servers... Please contact us!`)
        throw new Error()
      }

      const lt = semver.lt(package.version, data.deprecatedUnder)
      if (lt) {
        console.log("----------------");
        consola.info(
          `[SliceMachine] Important! Your version of "${package.name}" is deprecated.`
        );
        consola.info(
          `Please update it using "npm i --save-dev ${package.name}"`
        );
        console.log("----------------");
        throw new Error()
      }
    }
  }
}

module.exports = createCommunication;
// const url = handleUrl(endpoint, params);
// const tmpZipFile = tmp.tmpNameSync();

