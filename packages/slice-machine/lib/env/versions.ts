import npmFetch from "npm-registry-fetch";
import semver from "semver";
import axios from "axios";
import { SliceMachineVersion } from "@lib/env/semver";
import { ReleaseNote } from "@models/common/versions";

export async function findPackageVersions(
  packageName: string
): Promise<SliceMachineVersion[]> {
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
      console.log("Couldn't retrieve Github release notes");
      return {};
    });

  return stableVersionsOrdered.map((stableVersion: string) => {
    return {
      version: stableVersion,
      releaseNote: releaseNotesMap[stableVersion]
        ? releaseNotesMap[stableVersion].body
        : null,
    };
  });
}

export function findLatestNonBreakingUpdate(
  current: string,
  versions: SliceMachineVersion[]
): string | null {
  const minorUpdate = findHighestUpdateByKind("minor", current, versions);
  if (minorUpdate) return minorUpdate;

  const patchUpdate = findHighestUpdateByKind("patch", current, versions);
  if (patchUpdate) return patchUpdate;

  return null;
}

export function isUpdateAvailable(
  current: string,
  versions: SliceMachineVersion[]
): boolean {
  return Boolean(
    findHighestUpdateByKind("patch", current, versions) ||
      findHighestUpdateByKind("minor", current, versions) ||
      findHighestUpdateByKind("major", current, versions)
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
  versions: SliceMachineVersion[]
): string | null => {
  const minorVersion = current.replace(/^(\d+\.\d+).*/, "$1");
  const majorVersion = current.replace(/^(\d+).*/, "$1");

  const result = versions.reduce((acc, { version }) => {
    if (!/^\d+\.\d+\.\d+$/.test(version)) return acc;
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
