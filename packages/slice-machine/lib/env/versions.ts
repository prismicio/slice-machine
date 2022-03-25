import npmFetch from "npm-registry-fetch";
import semver from "semver";
import axios from "axios";
import {
  PackageChangelog,
  PackageVersion,
  ReleaseNote,
  VersionKind,
} from "@lib/models/common/versions";
import * as NodeUtils from "@slicemachine/core/build/node-utils";

export async function getPackageChangelog(
  dependencyCwd: string
): Promise<PackageChangelog> {
  const pkg = NodeUtils.retrieveJsonPackage(dependencyCwd);
  const pkgContent = pkg.content as { name?: string; version: string };
  if (!pkg.exists || !pkgContent?.name) {
    return {
      currentVersion: "",
      updateAvailable: false,
      latestNonBreakingVersion: null,
      versions: [],
    };
  }
  const currentVersion = pkgContent.version;
  const versions = await findPackageVersions(pkgContent.name);
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
      return {};
    });

  return stableVersionsOrdered.map(
    (stableVersion: string, index: number, versions: string[]) => {
      const kind: VersionKind | null =
        index !== versions.length - 1
          ? findVersionKind(stableVersion, versions[index + 1])
          : null;

      return {
        versionNumber: stableVersion,
        releaseNote: releaseNotesMap[stableVersion]
          ? releaseNotesMap[stableVersion].body
          : null,
        kind,
      };
    }
  );
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
  const minorVersion = extractMinorVersionFromVersion(current);
  const majorVersion = extractMajorVersionFromVersion(current);

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

const extractMinorVersionFromVersion = (version: string) =>
  version.replace(/^(\d+\.\d+).*/, "$1");
const extractMajorVersionFromVersion = (version: string) =>
  version.replace(/^(\d+).*/, "$1");

const findVersionKind = (
  targetVersion: string,
  previousVersion: string
): VersionKind | null => {
  if (semver.lte(targetVersion, previousVersion)) return null;

  if (isAPatchVersion(targetVersion, previousVersion)) {
    return VersionKind.PATCH;
  }

  if (isAMinorVersion(targetVersion, previousVersion)) {
    return VersionKind.MINOR;
  }

  if (isAMajorVersion(targetVersion, previousVersion)) {
    return VersionKind.MAJOR;
  }

  return null;
};

const isAPatchVersion = (
  targetVersion: string,
  previousVersion: string
): boolean | null => {
  if (semver.lte(targetVersion, previousVersion)) return null;
  const minorVersion = extractMinorVersionFromVersion(previousVersion);

  return targetVersion.startsWith(minorVersion);
};

const isAMinorVersion = (
  targetVersion: string,
  previousVersion: string
): boolean | null => {
  if (semver.lte(targetVersion, previousVersion)) return null;
  const majorVersion = extractMajorVersionFromVersion(previousVersion);

  return (
    targetVersion.startsWith(majorVersion) &&
    !isAPatchVersion(targetVersion, previousVersion)
  );
};

const isAMajorVersion = (
  targetVersion: string,
  previousVersion: string
): boolean | null => {
  if (semver.lte(targetVersion, previousVersion)) return null;
  const majorVersion = extractMajorVersionFromVersion(previousVersion);

  return !targetVersion.startsWith(majorVersion);
};
