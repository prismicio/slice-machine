#!/usr/bin/env node

import { Utils, FileSystem } from "slicemachine-core";
import {
  installSm,
  validatePkg,
  maybeExistingRepo,
  loginOrBypass,
} from "./steps";
import { findArgument } from "./utils";

async function init() {
  const cwd = findArgument(process.argv, "cwd") || process.cwd();
  const base = findArgument(process.argv, "base") || Utils.CONSTS.DEFAULT_BASE;

  console.log(
    Utils.purple(
      "You're about to configure Slicemachine... Press ctrl + C to cancel"
    )
  );

  await loginOrBypass(base);
  validatePkg(cwd);
  const config = FileSystem.getOrCreateAuthConfig();
  await maybeExistingRepo(config.cookies, base);
  await installSm(cwd);
}

void init();
