import npmFetch from "npm-registry-fetch";
import semver from "semver";
import type { UpdateVersionInfo } from "../models/common/Environment";

export async function fetchVersions(name: string): Promise<string[]> {
  return npmFetch
    .json(name)
    .then((json) => {
      const versions = (json.versions || {}) as Record<string, unknown>;
      return Object.keys(versions);
    })
    .catch(() => []);
}

const highest = (
  kind: "patch" | "minor" | "major",
  current: string,
  versions: string[]
): string => {
  const minorVersion = current.replace(/^(\d+\.\d+).*/, "$1");
  const majorVersion = current.replace(/^(\d+).*/, "$1");

  const top = versions.reduce((acc, version) => {
    if (/^\d+\.\d+\.\d+$/.test(version) === false) return acc;
    if (semver.gt(acc, version)) return acc;
    if (kind === "patch" && version.startsWith(minorVersion)) return version;
    if (
      kind === "minor" &&
      version.startsWith(majorVersion) &&
      version.startsWith(minorVersion) === false
    )
      return version;
    if (kind === "major" && version.startsWith(majorVersion) === false)
      return version;
    return acc;
  }, current);

  return top === current ? "" : top;
};

export function whatSortOfVersions(
  current: string,
  versions: string[]
): UpdateVersionInfo["availableVersions"] {
  return {
    patch: highest("patch", current, versions),
    minor: highest("minor", current, versions),
    major: highest("major", current, versions),
  };
}

export async function getAvailableVersionInfo(
  name: string,
  current: string
): Promise<UpdateVersionInfo["availableVersions"]> {
  const versions = await fetchVersions(name);
  return whatSortOfVersions(current, versions);
}
