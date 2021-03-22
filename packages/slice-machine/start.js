#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawn
const migrate = require('./changelog/migrate')

const { argv } = require('yargs')

async function handleChangelog(params) {
  try {
    await migrate(false, params)
  } catch(e) {
    console.error('An error occured while migrating file system. Continuing...')
    console.error(`Full error: ${e}`)
    return
  }
}

function writeLatest(pathToSmFile, version) {
  try {
    const json = JSON.parse(fs.readFileSync(pathToSmFile, 'utf-8'))
    fs.writeFileSync(pathToSmFile, JSON.stringify({ ...json, _latest: version }, null, 2))
  } catch(e) {
    console.log('[postinstall] Could not write sm.json file. Exiting...')
  }
}

async function handleMigration(cwd) {
  const pathToPkg = path.join(cwd, 'package.json')
  const pathToSmFile = path.join(cwd, 'sm.json')

  const { version } = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'))
  const cleanVersion = version.split('-')[0]

  await handleChangelog({ cwd, pathToPkg, pathToSmFile })
  writeLatest(pathToSmFile, cleanVersion)
}

async function run() {
  const cwd = process.cwd()
  const port = argv.p || argv.port
  if (!argv.skipMigration) {
    await handleMigration(cwd)
  }
  const start = spawn(`node`, ["-r", "esm", "./build/server/src/index.js"], {
    cwd: __dirname,
    port,
    env: {
      ...process.env,
      CWD: cwd,
      ...port ? {
        PORT: port
      } : null
    },
  });
  start.stdout.on("data", function (data) {
    console.log("[slice-machine] " + data.toString());
  });

  start.stderr.on("data", function (data) {
    console.log("[slice-machine] " + data.toString());
  });

  start.on("exit", function (code) {
    console.log("[slice-machine] Thanks for using SliceMachine");
  });
}

main()
async function main() {
  try {
    run()
  } catch (err) {
    console.error(`[slice-machine] An unexpected error occured. Exiting...`);
    console.log('Full error: ', err)
  }
}
