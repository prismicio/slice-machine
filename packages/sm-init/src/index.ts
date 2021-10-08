#!/usr/bin/env node

import { Utils, createCore, FileSystem } from 'slicemachine-core';
import { installSm, validatePkg, addScriptToPkg, maybeExistingRepo } from './steps/index.js';

async function init() {
  const cwd = process.cwd();
  const base = Utils.CONSTS.DEFAULT_BASE

  const config = FileSystem.getOrCreateAuthConfig()
  console.log(Utils.purple('You\'re about to configure Slicemachine... Press ctrl + C to cancel'));

  const core = createCore({
    cwd: cwd,
    base: config.base,
    manifest: {
      apiEndpoint: '' // to be defined in the choose directory step
    }
  })

  await core.Auth.login();
  validatePkg(cwd);
  const repoName = await maybeExistingRepo(config.cookies, config.base)
  console.log({repoName})
  await installSm(cwd);
  addScriptToPkg(cwd);
}

void init()