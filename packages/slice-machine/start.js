#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const util = require('util');
const spawn = require('child_process').spawn
const exec = util.promisify(require("child_process").exec)

const { argv } = require("yargs");


function build() {
  console.log(`[slice-machine] Initializing SliceMachine. This usually takes some time...`);
  return new Promise(function(resolve, reject) {
    const build = spawn(`yarn`, ['run', 'build'], {
      cwd: __dirname,
      env: {
        ...process.env,
        CWD: process.cwd()
      }
    })
    build.stdout.on('data', function (data) {
      console.log('[build] ' + data.toString());
    })
    build.stdout.on('data', function (data) {
      console.log('[build] ' + data.toString());
    })

    build.stderr.on('data', function (data) {
      console.log('[build] ' + data.toString());
    })

    build.on('exit', function (code) {
      if (code) {
        return reject(code)
      }
      return resolve(code)
    })
  })
}

function start() {
  const port = argv.p || argv.port || '8080';
  const start = spawn(`./node_modules/.bin/next`, ['start'], {
    cwd: __dirname,
    port,
    env: {
      ...process.env,
      CWD: process.cwd()
    }
  })
  start.stdout.on('data', function (data) {
    console.log('[slice-machine] ' + data.toString());
  })

  start.stderr.on('data', function (data) {
    console.log('[slice-machine] ' + data.toString());
  })

  start.on('exit', function (code) {
    console.log('[slice-machine] Thanks for using SliceMachine');
  })
}

main()
async function main() {
  try {
    if (fs.existsSync(path.join(__dirname, '.next'))) {
      console.log('start here')
      return start()
    }
    console.log('build here')
    build().then(() => {
      console.log('then start')
      start()
    }).catch(e => {
      throw(e)
    })

  } catch (err) {
    console.error(`[slice-machine] An unexpected error occured. Exiting...`);
    console.log('Full error: ', err)
  }
}
