#!/usr/bin/env node
import { DEFAULT_BASE } from "@slicemachine/core/build/src/defaults";
import { writeError, purple } from "@slicemachine/core/build/src/internals";
import { SharedConfigManager } from "@slicemachine/core/build/src/prismic";

import { Tracker } from "./utils/tracker";

import {
  installRequiredDependencies,
  validatePkg,
  maybeExistingRepo,
  createRepository,
  loginOrBypass,
  configureProject,
  displayFinalMessage,
  detectFramework,
  installLib,
} from "./steps";
import { findArgument } from "./utils";

async function init() {
  const cwd = findArgument(process.argv, "cwd") || process.cwd();
  const base = findArgument(process.argv, "base") || DEFAULT_BASE;
  const lib: string | undefined = findArgument(process.argv, "library");
  const branch: string | undefined = findArgument(process.argv, "branch");

  console.log(
    purple("You're about to configure Slicemachine... Press ctrl + C to cancel")
  );

  // verify package.json file exist
  validatePkg(cwd);

  // login
  const user = await loginOrBypass(base);
  if (!user) throw new Error("The user should be logged in!");

  // retrieve tokens for api calls
  const config = SharedConfigManager.get();

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

  const tracker = Tracker.build("JfTfmHaATChc4xueS7RcCBsixI71dJIJ", name, {
    userId: user.userId,
  });

  // install the required dependencies in the project.
  await installRequiredDependencies(cwd, frameworkResult.value);

  const sliceLibPath = lib
    ? await installLib(tracker, cwd, lib, branch)
    : undefined;

  // configure the SM.json file and the json package file of the project..
  configureProject(cwd, base, name, frameworkResult, sliceLibPath);

  // ask the user to run slice-machine.
  displayFinalMessage(cwd);
}

try {
  void init();
} catch (error) {
  if (error instanceof Error) writeError(error.message);
  else console.error(error);
}
