import npmFetch from "npm-registry-fetch";
import semver from "semver";
import axios from "axios";
import {
  ReleaseNote,
  PackageChangelog,
  PackageVersion,
} from "@models/common/versions";
import { FileSystem } from "@slicemachine/core";

export async function getPackageChangelog(
  dependencyCwd: string
): Promise<PackageChangelog> {
  const pkg = FileSystem.retrieveJsonPackage(dependencyCwd);
  if (!pkg.exists || !pkg.content?.name)
    return {
      currentVersion: "",
      updateAvailable: false,
      latestNonBreakingVersion: null,
      versions: [],
    };

  const currentVersion = pkg.content.version;
  const versions = await findPackageVersions(pkg.content.name);
  const updateAvailable = isUpdateAvailable(currentVersion, versions);
  const latestNonBreakingVersion = findLatestNonBreakingUpdate(
    currentVersion,
    versions
  );

  return {
    currentVersion,
    updateAvailable,
    latestNonBreakingVersion,
    versions,
  };
}

export function findLatestNonBreakingUpdate(
  current: string,
  versions: PackageVersion[]
): string | null {
  const minorUpdate = findHighestUpdateByKind("minor", current, versions);
  if (minorUpdate) return minorUpdate;

  const patchUpdate = findHighestUpdateByKind("patch", current, versions);
  if (patchUpdate) return patchUpdate;

  return null;
}

export function isUpdateAvailable(
  current: string,
  versions: PackageVersion[]
): boolean {
  return Boolean(
    findHighestUpdateByKind("patch", current, versions) ||
      findHighestUpdateByKind("minor", current, versions) ||
      findHighestUpdateByKind("major", current, versions)
  );
}

export async function findPackageVersions(
  packageName: string
): Promise<PackageVersion[]> {
  const versions = await fetchVersionsFromNpm(packageName);
  const stableVersions = versions.filter(
    (version) => /^\d+\.\d+\.\d+$/.test(version) && semver.lte("0.1.0", version)
  );
  const stableVersionsOrdered = stableVersions.sort().reverse();

  const releaseNotesMap: Record<string, ReleaseNote> = await axios
    .get<ReleaseNote[]>(
      "https://api.github.com/repos/prismicio/slice-machine/releases"
    )
    .then((response) => {
      const releaseNotes = response.data;
      return releaseNotes.reduce(
        (map: Record<string, ReleaseNote>, releaseNote) => {
          map[releaseNote.name] = releaseNote;
          return map;
        },
        {}
      );
    })
    .catch(() => {
      console.log(
        `Couldn't retrieve Github release notes for package ${packageName}`
      );
      return {};
    });

  return stableVersionsOrdered.map((stableVersion: string) => {
    return {
      versionNumber: stableVersion,
      releaseNote: releaseNotesMap[stableVersion]
        ? releaseNotesMap[stableVersion].body
        : null,
    };
  });
}

async function fetchVersionsFromNpm(packageName: string): Promise<string[]> {
  return npmFetch
    .json(packageName)
    .then((json) => {
      const versions = (json.versions || {}) as Record<string, unknown>;
      return Object.keys(versions);
    })
    .catch(() => []);
}

const findHighestUpdateByKind = (
  kind: "patch" | "minor" | "major",
  current: string,
  versions: PackageVersion[]
): string | null => {
  const minorVersion = current.replace(/^(\d+\.\d+).*/, "$1");
  const majorVersion = current.replace(/^(\d+).*/, "$1");

  const result = versions.reduce((acc, { versionNumber }) => {
    if (!/^\d+\.\d+\.\d+$/.test(versionNumber)) return acc;
    if (semver.gt(acc, versionNumber)) return acc;
    if (kind === "patch" && versionNumber.startsWith(minorVersion))
      return versionNumber;
    if (
      kind === "minor" &&
      versionNumber.startsWith(majorVersion) &&
      !versionNumber.startsWith(minorVersion)
    ) {
      return versionNumber;
    }
    if (kind === "major" && !versionNumber.startsWith(majorVersion)) {
      return versionNumber;
    }
    return acc;
  }, current);

  return result === current ? null : result;
};
