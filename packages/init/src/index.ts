import { Utils, FileSystem } from "@slicemachine/core";
import Tracker from "./utils/tracker";

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
  const base = findArgument(process.argv, "base") || Utils.CONSTS.DEFAULT_BASE;
  const lib: string | undefined = findArgument(process.argv, "library");
  const branch: string | undefined = findArgument(process.argv, "branch");
  const isTrackingAvailable =
    findArgument(process.argv, "tracking") !== "false";

  Tracker.get().initialize(
    process.env.NEXT_PUBLIC_SEGMENT_KEY || "JfTfmHaATChc4xueS7RcCBsixI71dJIJ",
    isTrackingAvailable
  );

  Tracker.get().trackInitStart();

  console.log(
    Utils.purple(
      "You're about to configure Slicemachine... Press ctrl + C to cancel"
    )
  );

  // verify package.json file exist
  validatePkg(cwd);

  // login
  const user = await loginOrBypass(base);
  if (!user) throw new Error("The user should be logged in!");

  // If we get the info from the profile we want to identify all the previous events sent or continue in anonymous mode
  if (user.profile) {
    Tracker.get().identifyUser(user.profile.shortId);
  }

  // retrieve tokens for api calls
  const config = FileSystem.PrismicSharedConfigManager.get();

  // detect the framework used by the project
  const frameworkResult = await detectFramework(cwd);

  // select the repository used with the project.
  const { existing, repository } = await maybeExistingRepo(
    config.cookies,
    cwd,
    config.base
  );

  if (!existing) {
    await createRepository(repository, frameworkResult.value, config);
  }

  // Install the required dependencies in the project.
  await installRequiredDependencies(cwd, frameworkResult.value);

  const sliceLibPath = lib ? await installLib(cwd, lib, branch) : undefined;

  // configure the SM.json file and the json package file of the project..
  configureProject(
    cwd,
    base,
    repository,
    frameworkResult,
    sliceLibPath,
    isTrackingAvailable
  );

  Tracker.get().trackInitDone(frameworkResult.value, repository);

  // Ask the user to run slice-machine.
  displayFinalMessage(cwd);
}

try {
  void init();
} catch (error) {
  if (error instanceof Error) Utils.writeError(error.message);
  else console.error(error);
}
