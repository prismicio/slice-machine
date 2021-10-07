#!/usr/bin/env node

import { Utils, Auth } from "slicemachine-core";
import { installSm, validatePkg, addScriptToPkg } from "./steps/index.js";

function findArgument(args: string[], name: string): string | null {
  const flagIndex: number = args.indexOf(`--${name}`);

  if (flagIndex === -1) return null;
  if (args.length < flagIndex + 2) return null;

  const flagValue = args[flagIndex + 1];

  if (flagValue.startsWith("--")) return null;
  return flagValue;
}

async function init() {
  const cwd = findArgument(process.argv, "cwd") || process.cwd();
  const base = findArgument(process.argv, "base") || Utils.CONSTS.DEFAULT_BASE;

  console.log(
    Utils.purple(
      "You're about to configure Slicemachine... Press ctrl + C to cancel"
    )
  );

  await Auth.login(base);
  validatePkg(cwd);
  await installSm(cwd);
  addScriptToPkg(cwd);
}

void init();
