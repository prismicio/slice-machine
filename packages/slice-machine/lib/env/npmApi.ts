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

const highestSemverVersionFor = (
  kind: "patch" | "minor" | "major",
  current: string,
  versions: string[]
): string | null => {
  const minorVersion = current.replace(/^(\d+\.\d+).*/, "$1");
  const majorVersion = current.replace(/^(\d+).*/, "$1");

  const result = versions.reduce((acc, version) => {
    if (/^\d+\.\d+\.\d+$/.test(version) === false) return acc;
    if (semver.gt(acc, version)) return acc;
    if (kind === "patch" && version.startsWith(minorVersion)) return version;
    if (
      kind === "minor" &&
      version.startsWith(majorVersion) &&
      !version.startsWith(minorVersion)
    ) {
      return version;
    }
    if (kind === "major" && !version.startsWith(majorVersion)) {
      return version;
    }
    return acc;
  }, current);

  return result === current ? null : result;
};

export function semverVersions(
  current: string,
  versions: string[]
): UpdateVersionInfo["availableVersions"] {
  return {
    patch: highestSemverVersionFor("patch", current, versions),
    minor: highestSemverVersionFor("minor", current, versions),
    major: highestSemverVersionFor("major", current, versions),
  };
}

export async function getAvailableVersionInfo(
  name: string,
  current: string
): Promise<UpdateVersionInfo["availableVersions"]> {
  const versions = await fetchVersions(name);
  return semverVersions(current, versions);
}
