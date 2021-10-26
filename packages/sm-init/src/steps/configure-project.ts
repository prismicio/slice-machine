import { FileSystem, Utils } from "slicemachine-core";

type Base = Utils.Endpoints.Base;

export function configureProject(
  cwd: string,
  base: Base,
  repository: string,
  framework: { value: Utils.Framework; manuallyAdded: boolean }
): void {
  const spinner = Utils.spinner(
    `Configuring your ${framework.value} & Prismic project...`
  );
  spinner.start();

  try {
    const manifest = FileSystem.retrieveManifest(cwd);

    const manifestUpdated: FileSystem.Manifest = {
      ...(manifest.exists && manifest.content ? manifest.content : {}),
      apiEndpoint: Utils.Endpoints.buildRepositoryEndpoint(base, repository),
      ...(framework.manuallyAdded ? { framework: framework.value } : {}),
    };

    if (!manifest.exists) FileSystem.createManifest(cwd, manifestUpdated);
    else FileSystem.patchManifest(cwd, manifestUpdated);

    const isScriptAdded = FileSystem.addJsonPackageSmScript(cwd);
    if (!isScriptAdded)
      throw new Error("Error adding the SM start script to your package.json");

    spinner.succeed("Project configured! Ready to start");
  } catch {
    spinner.fail("Failed to configure your Prismic Local Builder");
    process.exit(-1);
  }
}
