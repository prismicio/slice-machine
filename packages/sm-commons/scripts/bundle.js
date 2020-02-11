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

const path = require('path');
const actions = require("../actions");
const SM_CONFIG_FILE = 'sm.config.json'

console.log('path to lib : ', process.cwd())


/** Step 0: check that library version is not deprecated. Otherwise, ask for an update
 * 
 * 
 */

actions.readSmConfig(path.join(process.cwd(), SM_CONFIG_FILE));
// fs.writeFileSync(path.join(process.cwd(), 'slices.json'), example, 'utf8')

// This is meant to break on pre-commit
process.exit(-1)