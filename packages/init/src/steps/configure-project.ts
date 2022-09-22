import type { Models } from "@slicemachine/core";
import * as Prismic from "@slicemachine/core/build/prismic";
import * as NodeUtils from "@slicemachine/core/build/node-utils";
import { FrameworkResult } from "./detect-framework";
import { InitClient, logs } from "../utils";
import Tracker from "../utils/tracker";

export async function configureProject(
  client: InitClient,
  cwd: string,
  repositoryDomainName: string,
  framework: FrameworkResult,
  sliceLibPath: string[] = [],
  tracking = true
): Promise<void> {
  const frameworkName = NodeUtils.Framework.fancyName(framework.value);
  const spinner = logs.spinner(
    `Configuring your ${frameworkName} and Prismic project...`
  );
  spinner.start();

  try {
    const manifest = NodeUtils.retrieveManifest(cwd);
    const manifestAlreadyExistWithContent = manifest.exists && manifest.content;

    const libs =
      manifest.content &&
      manifest.content.libraries &&
      manifest.content.libraries.length > 0
        ? manifest.content.libraries
        : ["@/slices"];

    const manifestUpdated: Models.Manifest = {
      generateTypes: true,
      ...(manifestAlreadyExistWithContent ? manifest.content : {}),
      apiEndpoint: Prismic.Endpoints.buildRepositoryEndpoint(
        client.apisEndpoints.Wroom,
        repositoryDomainName
      ),
      libraries: [...libs, ...sliceLibPath], // odd case here for staters
      ...(framework.manuallyAdded ? { framework: framework.value } : {}),
      ...(!tracking ? { tracking } : {}),
    };

    if (!manifest.exists) NodeUtils.createManifest(cwd, manifestUpdated);
    else NodeUtils.patchManifest(cwd, manifestUpdated);

    // create the default slices folder if it doesn't exist.
    const pathToSlicesFolder = NodeUtils.CustomPaths(cwd)
      .library("slices")
      .value();
    if (
      !NodeUtils.Files.exists(pathToSlicesFolder) &&
      libs.includes("@/slices")
    ) {
      NodeUtils.Files.mkdir(pathToSlicesFolder, { recursive: true });
    }

    // add slicemachine script to package.json.
    NodeUtils.addJsonPackageSmScript(cwd);

    await Tracker.get().trackInitEndSuccess(framework.value);

    spinner.succeed("Project configured! Ready to start");
  } catch (error) {
    await Tracker.get().trackInitEndFail(
      framework.value,
      "Failed to configure Slice Machine"
    );
    spinner.fail("Failed to configure Slice Machine");
    process.exit(-1);
  }
}
