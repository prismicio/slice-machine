import { FileSystem, Utils } from "@slicemachine/core";
import type { Models } from "@slicemachine/core";
import { FrameworkResult } from "./detect-framework";

type Base = Utils.Endpoints.Base;

export function configureProject(
  cwd: string,
  base: Base,
  repository: string,
  framework: FrameworkResult,
  sliceLibPath: string[] = [],
  tracking = true
): void {
  const spinner = Utils.spinner(
    `Configuring your ${framework.value} & Prismic project...`
  );
  spinner.start();

  try {
    const manifest = FileSystem.retrieveManifest(cwd);

    const manifestUpdated: Models.Manifest = {
      ...(manifest.exists && manifest.content ? manifest.content : {}),
      apiEndpoint: Utils.Endpoints.buildRepositoryEndpoint(base, repository),
      libraries: ["@/slices", ...sliceLibPath],
      ...(framework.manuallyAdded ? { framework: framework.value } : {}),
      ...(tracking === false ? { tracking } : {}),
    };

    if (!manifest.exists) FileSystem.createManifest(cwd, manifestUpdated);
    else FileSystem.patchManifest(cwd, manifestUpdated);

    // create the default slices folder if it doesn't exist.
    const pathToSlicesFolder = FileSystem.CustomPaths(cwd)
      .library("slices")
      .value();
    if (!Utils.Files.exists(pathToSlicesFolder))
      Utils.Files.mkdir(pathToSlicesFolder, { recursive: true });

    // add slicemachine script to package.json.
    FileSystem.addJsonPackageSmScript(cwd);

    spinner.succeed("Project configured! Ready to start");
  } catch {
    spinner.fail("Failed to configure your Prismic Local Builder");
    process.exit(-1);
  }
}
