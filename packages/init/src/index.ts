import { ApplicationMode } from "@slicemachine/client";
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
import { findArgument, logs, getApplicationMode, Client } from "./utils";

async function init() {
  const cwd = findArgument(process.argv, "cwd") || process.cwd();
  const mode: ApplicationMode =
    getApplicationMode(findArgument(process.argv, "mode")) ||
    ApplicationMode.PROD;
  const lib: string | undefined = findArgument(process.argv, "library");
  const branch: string | undefined = findArgument(process.argv, "branch");
  const isTrackingAvailable: boolean =
    findArgument(process.argv, "tracking") !== "false";
  const preSelectedRepository: string | undefined = findArgument(
    process.argv,
    "repository"
  );

  Tracker.get().initialize(
    process.env.PUBLIC_SM_INIT_SEGMENT_KEY ||
      "JfTfmHaATChc4xueS7RcCBsixI71dJIJ",
    isTrackingAvailable
  );

  void Tracker.get().trackInitStart(preSelectedRepository);

  // initializing the client with what we have for now.
  Client.initialize(mode, Prismic.PrismicSharedConfigManager.getAuth());

  console.log(
    logs.purple(
      "You're about to configure Slicemachine... Press ctrl + C to cancel"
    )
  );

  // verify package.json file exist
  validatePkg(cwd);

  // login
  const user = await loginOrBypass();

  Tracker.get().identifyUser(user.shortId, user.intercomHash);
  void Tracker.get().trackInitIdentify();

  // detect the framework used by the project
  const frameworkResult = await detectFramework(cwd);

  // select the repository used with the project.
  const repository = await chooseOrCreateARepository(
    cwd,
    frameworkResult.value,
    preSelectedRepository
  );

  Tracker.get().setRepository(repository);
  Client.get().updateRepository(repository);

  // Install the required dependencies in the project.
  await installRequiredDependencies(cwd, frameworkResult.value);

  const sliceLibPath = lib ? await installLib(cwd, lib, branch) : undefined;

  // configure the SM.json file and the json package file of the project..
  await configureProject(
    cwd,
    repository,
    frameworkResult,
    sliceLibPath,
    isTrackingAvailable
  );

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
