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
  sendStarterData,
  setVersion,
} from "./steps";
import {
  findArgument,
  findFlag,
  logs,
  getApplicationMode,
  InitClient,
} from "./utils";
import { Models } from "@slicemachine/core";

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
  const pushDocuments = !findFlag(process.argv, "no-docs");

  Tracker.get().initialize(
    process.env.PUBLIC_SM_INIT_SEGMENT_KEY ||
      "JfTfmHaATChc4xueS7RcCBsixI71dJIJ",
    isTrackingAvailable
  );

  void Tracker.get().trackInitStart(preSelectedRepository);

  // initializing the client with what we have for now.
  const client = new InitClient(
    mode,
    null,
    Prismic.PrismicSharedConfigManager.getAuth()
  );

  console.log(
    logs.purple(
      "You're about to configure Slicemachine... Press ctrl + C to cancel"
    )
  );

  // verify package.json file exist
  validatePkg(cwd);

  // login
  const user = await loginOrBypass(client);

  Tracker.get().identifyUser(user.shortId, user.intercomHash);
  void Tracker.get().trackInitIdentify();

  // detect the framework used by the project
  const frameworkResult = await detectFramework(cwd);

  // select the repository used with the project.
  const repository = await chooseOrCreateARepository(
    client,
    cwd,
    frameworkResult.value,
    preSelectedRepository
  );

  Tracker.get().setRepository(repository);
  client.updateRepository(repository);

  const sliceLibPath = lib ? await installLib(cwd, lib, branch) : undefined;

  const wasStarter = await sendStarterData(client, cwd, pushDocuments); // will be false if no sm.json is found

  // configure the SM.json file and the json package file of the project..
  await configureProject(
    client,
    cwd,
    repository,
    frameworkResult,
    sliceLibPath,
    isTrackingAvailable
  );

  // Install the required dependencies in the project.
  await installRequiredDependencies(cwd, frameworkResult.value, wasStarter);

  setVersion(cwd);

  // Ask the user to run slice-machine.
  displayFinalMessage(cwd, wasStarter, repository, client.apisEndpoints.Wroom);
}

init()
  .then(() => {
    process.exit(0);
  })
  .catch(async (error) => {
    if (error instanceof Error) logs.writeError(error.message);
    else console.error(error);
    await Tracker.get().trackInitEndFail(
      Models.Frameworks.none,
      "Failed to initialise Slice Machine."
    );
  });
