#!/usr/bin/env node

import { FileSystem } from 'slicemachine-core';
import ora from 'ora';

import { InitOperation } from './types/init.js';
import { installSm } from './steps/index.js';

import { purple } from './utils/index.js';

function logStep(step: string) {
  return console.log(`[Slicemachine init] ${step}`)
}

function logError(message: string) {
  return logStep(`Failure: ${message}`)
}

async function init() {
  console.log(purple('You\'re about to configure Slicemachine... Press ctrl + C to cancel'))

  const spinner = ora('Loading something');
  spinner.start()

  setTimeout(() => {
    spinner.stop()
  }, 2000)
  return
  const cwd = process.cwd();
  // const smModuleCWD = require.main?.paths[0].split("node_modules")[0];

  logStep('Checking your Package.json file')
  const jsonPackage = FileSystem.JsonPackage.retrieveJsonPackage(cwd);
  if (!jsonPackage.exists) return logError(`Missing json package file`)
  if (!jsonPackage.content) return logError('Could not parse the json package file properly')

  logStep('Installing Slicemachine in your project')
  const smInstall: InitOperation = await installSm(cwd)
  // if (smInstall.status === InitOperationStatus.FAILURE) return logError(smInstall.content)
  console.log(smInstall.content)

  logStep('Adding the Slicemachine start script to your package.json')
  FileSystem.JsonPackage.addSmScript(cwd)
}

init()