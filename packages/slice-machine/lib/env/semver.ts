import path from "path";
import fetch from "node-fetch";
import Files from "../utils/files";
import { YarnLock } from "../models/paths";
import { getAvailableVersionInfo, isUpdateAvailable } from "./npmApi";

interface Manifest {
  name: string;
  version: string;
}

export interface SliceMachineVersion {
  version: string;
  releaseNote: string | null;
}

export interface Comparison {
  currentVersion: string;
  onlinePackage: Manifest | null;
  updateAvailable: boolean;
  updateCommand: string;
  packageManager: "npm" | "yarn";
  availableVersions: SliceMachineVersion[];
}

const DefaultComparison: Comparison = {
  currentVersion: "",
  onlinePackage: null,
  updateAvailable: false,
  updateCommand: "",
  packageManager: "npm",
  availableVersions: [],
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

      const versions = await getAvailableVersionInfo(manifest.name);

      const onlinePackage = await fetchJsonPackage(manifest.name);
      const updateAvailable = isUpdateAvailable(manifest.version, versions);
      const isYarnPackageManager = Files.exists(YarnLock(cwd));
      const updateCommand = "toto";

      return {
        currentVersion: manifest.version,
        onlinePackage,
        updateAvailable,
        updateCommand,
        packageManager: isYarnPackageManager ? "yarn" : "npm",
        availableVersions: versions,
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
