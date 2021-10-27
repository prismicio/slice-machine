/* eslint-disable */
import path from "path";
import fetch from "node-fetch";

// @ts-ignore
import semver from "semver";
// @ts-ignore
import dedent from "dedent";
import boxen from "boxen";
import { logger } from "@lib/utils/logger";
import Files from "../utils/files";
import { YarnLock } from "../models/paths";
import PackageVersion from "@models/common/PackageVersion";

interface Manifest {
  name: string;
  version: string;
}

const MessageByManager = {
  YARN: (name: string) => `yarn add -D ${name}`,
  NPM: (name: string) => `npm i --save-dev ${name}`,
};

const createMessage = (name: string, cwd: string) =>
  Files.exists(YarnLock(cwd))
    ? MessageByManager.YARN(name)
    : MessageByManager.NPM(name);

async function fetchJsonPackage(packageName: string) {
  try {
    const response = await fetch(
      `https://unpkg.com/${packageName}/package.json`
    );
    if (response.status !== 200) {
      throw new Error(
        `[scripts/bundle] Unable to fetch JSON package for package "${packageName}"`
      );
    }
    return await response.json();
  } catch (e) {
    return e;
  }
}

const compare = (
  manifest: Manifest,
  onlinePackage: Manifest,
  { cwd }: { cwd: string }
) => {
  if (!(onlinePackage instanceof Error)) {
    const lt = semver.lt(manifest.version, onlinePackage.version);
    if (lt) {
      return {
        current: manifest.version,
        next: onlinePackage.version,
        message: createMessage(manifest.name, cwd),
      };
    }
    return null;
  }
  console.warn("[env/semver] Could not fetch latest version of plugin.");
  return null;
};

interface Comparison {
  currentVersion?: string;
  onlinePackage?: { version: string };
  updateAvailable?: PackageVersion | null;
  err?: Error;
}

export function logVersion(npmCompare: Comparison | undefined) {
  if (!npmCompare) {
    return;
  }

  const hasUpdate = npmCompare.updateAvailable && npmCompare.onlinePackage;
  if (!npmCompare.err) {
    logger.plain(
      boxen(
        dedent(`🍕 Slicemachine ${
          npmCompare?.currentVersion?.split("-")[0]
        } started.
          ${
            hasUpdate && npmCompare.onlinePackage
              ? `
            A new version (${npmCompare.onlinePackage.version}) is available!
            Upgrade now: yarn add slice-machine-ui@latest
          `
              : "\nYour version is up to date!"
          }
          
          
        `),
        { padding: 1, borderColor: hasUpdate ? "red" : "green" }
      )
    );
  } else {
    console.error("[slice-machine] Could not fetch package versions.");
  }
}

export function createComparator(pathToPkg: string) {
  let comparison: Comparison | undefined;
  return async ({ cwd }: { cwd: string }) => {
    if (comparison !== undefined) {
      return comparison;
    }
    const manifest = (() => {
      try {
        if (Files.exists(pathToPkg)) {
          return Files.readJson(pathToPkg);
        }
      } catch (e) {
        return null;
      }
    })();
    if (!manifest) {
      comparison = {
        err: new Error("Could not parse package version"),
      };
      return comparison;
    }

    const onlinePackage = await fetchJsonPackage(manifest.name);
    const updateAvailable = compare(manifest, onlinePackage, { cwd });

    comparison = {
      currentVersion: manifest.version,
      onlinePackage,
      updateAvailable,
    };
    return comparison;
  };
}
export default async function comparator(
  { cwd }: { cwd: string },
  log = false
) {
  const pathToPkg = path.join(cwd, "package.json");
  const compareNpmVersions = createComparator(pathToPkg);
  const response = await compareNpmVersions({ cwd });
  if (log) {
    logVersion(response);
  }
  return response;
}
