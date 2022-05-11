import { CONSTS } from "@slicemachine/core";
import Prismic from "@slicemachine/core/build/prismic";
import Tracker from "./utils/tracker";
import {
  installRequiredDependencies,
  validatePkg,
  chooseOrCreateARepository,
  loginOrBypass,
  configureProject,
  displayFinalMessage,
  detectFramework,
  installLib,
} from "./steps";
import { findArgument, logs } from "./utils";

async function init() {
  const cwd = findArgument(process.argv, "cwd") || process.cwd();
  const base = findArgument(process.argv, "base") || CONSTS.DEFAULT_BASE;
  const lib: string | undefined = findArgument(process.argv, "library");
  const branch: string | undefined = findArgument(process.argv, "branch");
  const isTrackingAvailable =
    findArgument(process.argv, "tracking") !== "false";
  const maybeRepositorySubdomain = findArgument(process.argv, "repository");

  Tracker.get().initialize(
    process.env.PUBLIC_SM_INIT_SEGMENT_KEY ||
      "JfTfmHaATChc4xueS7RcCBsixI71dJIJ",
    isTrackingAvailable
  );

  void Tracker.get().trackInitStart(maybeRepositorySubdomain);

  console.log(
    logs.purple(
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
    Tracker.get().identifyUser(user.profile.shortId, user.profile.intercomHash);
  }

  void Tracker.get().trackInitIdentify();

  // retrieve tokens for api calls
  const config = Prismic.PrismicSharedConfigManager.get();

  // detect the framework used by the project
  const frameworkResult = await detectFramework(cwd);

  // select the repository used with the project.
  const repositoryDomainName = await chooseOrCreateARepository(
    cwd,
    frameworkResult.value,
    config.cookies,
    config.base,
    maybeRepositorySubdomain
  );

  Tracker.get().setRepository(repositoryDomainName);

  // Install the required dependencies in the project.
  await installRequiredDependencies(cwd, frameworkResult.value);

  const sliceLibPath = lib ? await installLib(cwd, lib, branch) : undefined;

  // configure the SM.json file and the json package file of the project..
  configureProject(
    cwd,
    base,
    repositoryDomainName,
    frameworkResult,
    sliceLibPath,
    isTrackingAvailable
  );

  await Tracker.get().trackInitDone(frameworkResult.value);

  // Ask the user to run slice-machine.
  displayFinalMessage(cwd);
}

init()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    if (error instanceof Error) logs.writeError(error.message);
    else console.error(error);
  });
