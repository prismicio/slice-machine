import { CONSTS } from "@slicemachine/core";
import type { Models } from "@slicemachine/core";
import * as Prismic from "@slicemachine/core/build/prismic";
import * as NodeUtils from "@slicemachine/core/build/node-utils";
import { FrameworkResult } from "./detect-framework";
import { logs } from "../utils";
import Tracker from "../utils/tracker";

type Base = Prismic.Endpoints.Base;

const defaultSliceMachineVersion = "0.0.41";

export async function configureProject(
  cwd: string,
  base: Base,
  repositoryDomainName: string,
  framework: FrameworkResult,
  sliceLibPath: string[] = [],
  tracking = true
): Promise<void> {
  const spinner = logs.spinner(
    `Configuring your ${framework.value} & Prismic project...`
  );
  spinner.start();

  try {
    const manifest = NodeUtils.retrieveManifest(cwd);
    const packageJson = NodeUtils.retrieveJsonPackage(cwd);

    const sliceMachineVersionInstalled =
      getTheSliceMachineVersionInstalled(packageJson);

    const manifestAlreadyExistWithContent = manifest.exists && manifest.content;

    const manifestUpdated: Models.Manifest = {
      ...(manifestAlreadyExistWithContent
        ? manifest.content
        : { _latest: sliceMachineVersionInstalled }),
      apiEndpoint: Prismic.Endpoints.buildRepositoryEndpoint(
        base,
        repositoryDomainName
      ),
      libraries: ["@/slices", ...sliceLibPath],
      ...(framework.manuallyAdded ? { framework: framework.value } : {}),
      ...(!tracking ? { tracking } : {}),
    };

    if (!manifest.exists) NodeUtils.createManifest(cwd, manifestUpdated);
    else NodeUtils.patchManifest(cwd, manifestUpdated);

    // create the default slices folder if it doesn't exist.
    const pathToSlicesFolder = NodeUtils.CustomPaths(cwd)
      .library("slices")
      .value();
    if (!NodeUtils.Files.exists(pathToSlicesFolder)) {
      NodeUtils.Files.mkdir(pathToSlicesFolder, { recursive: true });
    }

    // add slicemachine script to package.json.
    NodeUtils.addJsonPackageSmScript(cwd);

    await Tracker.get().trackInitDone(framework.value);

    spinner.succeed("Project configured! Ready to start");
  } catch {
    spinner.fail("Failed to configure Slice Machine");
    process.exit(-1);
  }
}

const getTheSliceMachineVersionInstalled = (
  packageJson: NodeUtils.FileContent<NodeUtils.JsonPackage>
) => {
  const sliceMachinePackageInstalled = Object.entries(
    packageJson.content?.devDependencies || {}
  ).find((devDependency) => {
    if (devDependency[0] === CONSTS.SM_PACKAGE_NAME) {
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
