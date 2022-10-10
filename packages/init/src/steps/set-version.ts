import { CONSTS } from "@slicemachine/core";
import * as NodeUtils from "@slicemachine/core/build/node-utils";
import { has } from "fp-ts/lib/Record";
import { logs } from "../utils";

const defaultSliceMachineVersion = "0.0.41";

function isRecord(o: unknown): o is Record<string, string> {
  return typeof o === "object" && o !== null && !Array.isArray(o);
}

const getTheSliceMachineVersionInstalled = (
  packageJson: null | NodeUtils.JsonPackage
) => {
  if (packageJson === null) return defaultSliceMachineVersion;

  if (
    packageJson &&
    isRecord(packageJson) &&
    "devDependencies" in packageJson &&
    isRecord(packageJson.devDependencies) &&
    has(CONSTS.SM_PACKAGE_NAME, packageJson.devDependencies)
  ) {
    const maybeVersion = extractVersionNumberFromSemver(
      packageJson.devDependencies[CONSTS.SM_PACKAGE_NAME]
    );
    return maybeVersion || defaultSliceMachineVersion;
  }

  return defaultSliceMachineVersion;
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
    const sliceMachineVersionInstalled = getTheSliceMachineVersionInstalled(
      packageJson.content
    );

    NodeUtils.patchManifest(cwd, { _latest: sliceMachineVersionInstalled });
  } catch {
    logs.warning(
      "Could not set _latest to installed slice-machine-ui version in sm.json"
    );
  }
}
