#!/usr/bin/env node
const spawn = require('child_process').spawn

const { argv } = require("yargs");

function run() {
  const port = argv.p || argv.port
  const start = spawn(`node`, ["-r", "esm", "./server/index.js"], {
    cwd: __dirname,
    port,
    env: {
      ...process.env,
      CWD: process.cwd(),
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
