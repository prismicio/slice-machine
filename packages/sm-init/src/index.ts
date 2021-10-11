#!/usr/bin/env node

import { Utils, createCore } from 'slicemachine-core';
import { installSm, validatePkg, addScriptToPkg } from './steps/index.js';

function findArgument(args: string[], name: string): string | null {
  const flagIndex: number = args.indexOf(`--${name}`);

  if (flagIndex === -1) return null
  if (args.length < flagIndex + 2) return null

  const flagValue = args[flagIndex + 1];

  if (flagValue.startsWith('--')) return null
  return flagValue
}

async function init() {
  const cwd = findArgument(process.argv, 'cwd') || process.cwd();
  const base = findArgument(process.argv, 'base') || Utils.CONSTS.DEFAULT_BASE

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