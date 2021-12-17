import { FileSystem, Utils } from "@slicemachine/core";
import type { Models } from "@slicemachine/core";
import { FrameworkResult } from "./detect-framework";

type Base = Utils.Endpoints.Base;

export function configureProject(
  cwd: string,
  base: Base,
  repository: string,
  framework: FrameworkResult,
  sliceLibPath: string[]
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
    };

    if (!manifest.exists) FileSystem.createManifest(cwd, manifestUpdated);
    else FileSystem.patchManifest(cwd, manifestUpdated);

    FileSystem.addJsonPackageSmScript(cwd);

    spinner.succeed("Project configured! Ready to start");
  } catch {
    spinner.fail("Failed to configure your Prismic Local Builder");
    process.exit(-1);
  }
}
