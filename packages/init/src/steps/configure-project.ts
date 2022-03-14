import { FileSystem, Utils } from "@slicemachine/core";
import type { Models } from "@slicemachine/core";
import { FrameworkResult } from "./detect-framework";
import { FileContent, JsonPackage } from "@slicemachine/core/build/filesystem";

type Base = Utils.Endpoints.Base;

const defaultSliceMachineVersion = "0.0.41";

export function configureProject(
  cwd: string,
  base: Base,
  repositoryDomainName: string,
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
    const packageJson = FileSystem.retrieveJsonPackage(cwd);

    const sliceMachineVersionInstalled =
      getTheSliceMachineVersionInstalled(packageJson);

    const manifestAlreadyExistWithContent = manifest.exists && manifest.content;
    const manifestUpdated: Models.Manifest = {
      ...(manifestAlreadyExistWithContent
        ? manifest.content
        : { _latest: sliceMachineVersionInstalled }),
      apiEndpoint: Utils.Endpoints.buildRepositoryEndpoint(
        base,
        repositoryDomainName
      ),
      libraries: ["@/slices", ...sliceLibPath],
      ...(framework.manuallyAdded ? { framework: framework.value } : {}),
      ...(!tracking ? { tracking } : {}),
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
    spinner.fail("Failed to configure Slice Machine");
    process.exit(-1);
  }
}

const getTheSliceMachineVersionInstalled = (
  packageJson: FileContent<JsonPackage>
) => {
  const sliceMachinePackageInstalled = Object.entries(
    packageJson.content?.devDependencies || {}
  ).find((devDependency) => {
    if (devDependency[0] === Utils.CONSTS.SM_PACKAGE_NAME) {
      return devDependency;
    }
  });

  if (!sliceMachinePackageInstalled) {
    return defaultSliceMachineVersion;
  }

  const extractedVersion = extractVersionNumberFromSemver(
    sliceMachinePackageInstalled[1]
  );

  if (!extractedVersion) {
    return defaultSliceMachineVersion;
  }

  return extractedVersion;
};

const extractVersionNumberFromSemver = (semver: string) => {
  const versionFound = semver.match(/\d+\.\d+\.\d+/);

  if (versionFound && versionFound.length > 0) {
    return versionFound[0];
  }

  return null;
};
