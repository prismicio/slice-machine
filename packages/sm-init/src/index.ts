#!/usr/bin/env node

import { Utils, createCore } from 'slicemachine-core';
import { installSm, validatePkg, addScriptToPkg } from './steps/index.js';


async function init() {
  const cwd = process.cwd();
  const base = Utils.CONSTS.DEFAULT_BASE
  console.log(Utils.purple('You\'re about to configure Slicemachine... Press ctrl + C to cancel'));

  const core = createCore({
    cwd: cwd,
    base: base,
    manifest: {
      apiEndpoint: '' // to be defined in the choose directory step
    }
  })

  await core.Auth.login();
  validatePkg(cwd);
  await installSm(cwd);
  addScriptToPkg(cwd);
}

void init()