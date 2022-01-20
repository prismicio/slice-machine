import path from "path";
import fetch from "node-fetch";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import semver from "semver";
import Files from "../utils/files";
import { YarnLock } from "../models/paths";

interface Manifest {
  name: string;
  version: string;
}

interface Comparison {
  currentVersion: string;
  onlinePackage: Manifest | null;
  updateAvailable: boolean;
  updateCommand: string;
  packageManager: "npm" | "yarn";
}

const DefaultComparison: Comparison = {
  currentVersion: "",
  onlinePackage: null,
  updateAvailable: false,
  updateCommand: "",
  packageManager: "npm",
};

const MessageByManager = {
  YARN: (name: string) => `yarn upgrade -D ${name}`,
  NPM: (name: string) => `npm i --save-dev ${name}`,
};

async function fetchJsonPackage(packageName: string): Promise<Manifest> {
  const response = await fetch(`https://unpkg.com/${packageName}/package.json`);
  if (response.status !== 200) {
    throw new Error(
      `[scripts/bundle] Unable to fetch JSON package for package "${packageName}"`
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await response.json();
}

export const createComparator =
  (pathToPkg: string): ((param: { cwd: string }) => Promise<Comparison>) =>
  async ({ cwd }) => {
    try {
      if (!Files.exists(pathToPkg)) {
        return DefaultComparison;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const manifest: Manifest = Files.readJson(pathToPkg);
      const onlinePackage = await fetchJsonPackage(manifest.name);
      const updateAvailable = semver.lt(
        manifest.version,
        onlinePackage.version
      );
      const isYarnPackageManager = Files.exists(YarnLock(cwd));
      const updateCommand = isYarnPackageManager
        ? MessageByManager.YARN(manifest.name)
        : MessageByManager.NPM(manifest.name);

      return {
        currentVersion: manifest.version,
        onlinePackage,
        updateAvailable,
        updateCommand,
        packageManager: isYarnPackageManager ? "yarn" : "npm",
      };
    } catch (e) {
      return DefaultComparison;
    }
  };

export default async function comparator({
  cwd,
}: {
  cwd: string;
}): Promise<Comparison> {
  const pathToPkg = path.join(cwd, "package.json");
  const compareNpmVersions = createComparator(pathToPkg);
  return await compareNpmVersions({ cwd });
}
