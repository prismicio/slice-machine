#!/usr/bin/env node

import { Utils, FileSystem } from "@slicemachine/core";
import {
  installSm,
  validatePkg,
  maybeExistingRepo,
  createRepository,
  loginOrBypass,
  configureProject,
  displayFinalMessage,
  detectFramework,
} from "./steps";
import { findArgument } from "./utils";

async function init() {
  const cwd = findArgument(process.argv, "cwd") || process.cwd();
  const base = (findArgument(process.argv, "base") ||
    Utils.CONSTS.DEFAULT_BASE) as Utils.Endpoints.Base;

  console.log(
    Utils.purple(
      "You're about to configure Slicemachine... Press ctrl + C to cancel"
    )
  );

  // verify package.json file exist
  validatePkg(cwd);

  // login
  await loginOrBypass(base);

  // retrieve tokens for api Calls
  const config = FileSystem.getOrCreateAuthConfig();

  // detect the framework used by the project
  const frameworkResult = await detectFramework(cwd);

  // select the repository used with the project.
  const { existing, name } = await maybeExistingRepo(
    config.cookies,
    cwd,
    config.base
  );

  if (!existing) {
    await createRepository(name, frameworkResult.value, config);
  }

  // install the required dependencies in the project.
  await installSm(cwd, frameworkResult.value);

  // configure the SM.json file and the json package file of the project..
  configureProject(cwd, base, name, frameworkResult);

  // ask the user to run slice-machine.
  displayFinalMessage(cwd);
}

try {
  void init();
} catch (error) {
  if (error instanceof Error) Utils.writeError(error.message);
  else console.error(error);
}
