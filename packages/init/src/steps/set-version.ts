import { CONSTS } from "@slicemachine/core";
import * as NodeUtils from "@slicemachine/core/build/node-utils";
import { logs } from "../utils";

const defaultSliceMachineVersion = "0.0.41";

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

export function setVersion(cwd: string): void {
  try {
    const manifest = NodeUtils.retrieveManifest(cwd);

    if (manifest.content?._latest) {
      return;
    }

    const packageJson = NodeUtils.retrieveJsonPackage(cwd);
    const sliceMachineVersionInstalled =
      getTheSliceMachineVersionInstalled(packageJson);

    NodeUtils.patchManifest(cwd, { _latest: sliceMachineVersionInstalled });
  } catch {
    logs.warning(
      "Could not set _latest to installed slice-machine-ui version in sm.json"
    );
  }
}
