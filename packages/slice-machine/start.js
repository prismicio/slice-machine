#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const { argv } = require("yargs");

const { SM_FILE } = require('sm-commons/consts')

const execOpts = {
  cwd: __dirname,
};

main()
async function main() {
  try {
    console.log(`[slice-machine] Preparing...`);
    const config = handleConfig()
    const port = argv.p || argv.port || config.port || "8080";
    fs.writeFileSync(path.join(__dirname, 'conf.json'), JSON.stringify({ ...config, cwd: process.cwd() }))

    await exec(`./node_modules/.bin/next build`, execOpts);
    exec(`./node_modules/.bin/next start --port ${port}`, execOpts);
    console.log(`[slice-machine] Running at http://localhost:${port}`);

  } catch (err) {
    console.error(`[slice-machine] An unexpected error occured. Exiting...`);
    console.log('Full error: ', err)
  }
}

function getJsonFile(p, fileName, shouldThrow = false) {
  if (!fs.existsSync(p)) {
    if (shouldThrow) {
      throw new Error(`[slice-machine] Could not locate file "${fileName}" at path "${p}"`)
    }
    return {}
  }
  return JSON.parse(fs.readFileSync(p, 'utf-8'))
}

function handleConfig() {
  const pathToConfig = path.join(process.cwd(), '.slicemachine', 'config.json')
  const config = getJsonFile(pathToConfig)
  const pathToManifest = path.join(process.cwd(), config.manifest || SM_FILE);
  const manifest = getJsonFile(pathToManifest, SM_FILE, true);
  return Object.assign(manifest, config);
}