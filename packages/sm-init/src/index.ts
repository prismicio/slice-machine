#!/usr/bin/env node

// import { InitOperationStatus } from './types/init.js';
import { FileSystem } from 'slicemachine-core'
import { installSm, validatePkg } from './steps/index.js';

import { purple } from './utils/index.js';

async function init() {
  const cwd = process.cwd();
  console.log(purple('You\'re about to configure Slicemachine... Press ctrl + C to cancel'));

  validatePkg(cwd);
  await installSm(cwd);

  void FileSystem.JsonPackage.addSmScript(cwd);
}

void init()