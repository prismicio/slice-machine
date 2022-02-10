import npmFetch from "npm-registry-fetch";
import semver from "semver";
import axios, { AxiosResponse } from "axios";
import { SliceMachineVersion } from "@lib/env/semver";

interface ReleaseNote {
  name: string;
  body: string;
  draft: boolean;
}

export async function fetchVersions(name: string): Promise<string[]> {
  return npmFetch
    .json(name)
    .then((json) => {
      const versions = (json.versions || {}) as Record<string, unknown>;
      return Object.keys(versions);
    })
    .catch(() => []);
}

export const highestSemverVersionFor = (
  kind: "patch" | "minor" | "major",
  current: string,
  versions: SliceMachineVersion[]
): string | null => {
  const minorVersion = current.replace(/^(\d+\.\d+).*/, "$1");
  const majorVersion = current.replace(/^(\d+).*/, "$1");

  const result = versions.reduce((acc, { version }) => {
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

export function isUpdateAvailable(
  current: string,
  versions: SliceMachineVersion[]
): boolean {
  const versionFlag = {
    patch: highestSemverVersionFor("patch", current, versions),
    minor: highestSemverVersionFor("minor", current, versions),
    major: highestSemverVersionFor("major", current, versions),
  };

  return !!(versionFlag.patch || versionFlag.minor || versionFlag.major);
}

export async function getAvailableVersionInfo(
  name: string
): Promise<SliceMachineVersion[]> {
  const versions = await fetchVersions(name);
  const stableVersions = versions.filter(
    (version) => /^\d+\.\d+\.\d+$/.test(version) && semver.lte("0.1.0", version)
  );
  const stableVersionsOrdered = stableVersions.sort().reverse();
  let releaseNoteMap: Record<string, ReleaseNote> = {};

  try {
    const releaseNotes = await axios
      .get("https://api.github.com/repos/prismicio/slice-machine/releases")
      .then((r: AxiosResponse<ReleaseNote[]>) => r.data);
    releaseNoteMap = releaseNotes.reduce(
      (map: Record<string, ReleaseNote>, releaseNote) => {
        map[releaseNote.name] = releaseNote;
        return map;
      },
      {}
    );
  } catch (e) {
    console.log(e);
  }

  return stableVersionsOrdered.map((stableVersion: string) => {
    return {
      version: stableVersion,
      releaseNote: releaseNoteMap[stableVersion]
        ? releaseNoteMap[stableVersion].body
        : null,
    };
  });
}
