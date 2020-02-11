/** 
 * This scripts validates a given SM library
 * and bundles its JSON representation.
 * 
 * It should be dev installed by library owner and called on pre-publish hook
 * 
*/


/**
 * - from process.cwd(), parse and use sm.config.json
 * - find slices folder, test components
 * - test model et meta JSON files
 * - concatenate them (like current slices API does)
 * - write to file slices.json (or config.pathToSlicesDef)
 * - exit 0
 */

const path = require('path')
const consola = require('consola')

const actions = require('../methods/actions')
const createCommunication = require('../methods/communication')

const SM_CONFIG_FILE = 'sm.config.json'

const API_ENDPOINT = 'http://community-slices.com/api'
// const API_ENDPOINT = "http://localhost:3000/api";

/** Step 0: check that library version is not deprecated. Otherwise, ask for an update
 * 
 * 
 */

// console.log("your path to lib : ", pathToLib);

// console.log("path to slices : ", path.join(pathToLib, smConfig.slicesFolder || 'slices'))


async function main() {
  try {
    const communication = createCommunication({ apiEndpoint: API_ENDPOINT });

    const version = await communication.versionIsValid();

    const config = actions.readConfig(path.join(process.cwd(), SM_CONFIG_FILE));
    const pathToLib = actions.pathToLib(config);
    const pathToSlices = actions.pathToSlices(config, pathToLib);

    const slices = actions.fetchSliceDefinitions(pathToSlices);

    actions.writeSmFile(JSON.stringify(slices));

    consola.success(
      '[SliceMachine] Successfully created file "sm.json". You should commit it with your library changes!'
    );
    process.exit(0);
  } catch (e) {
    consola.error('[SliceMachine] Commit aborted. An error occured while bundling your slice library')
    console.log(`[full error] ${e}\n`)
    process.exit(-1);
  }
}

main()