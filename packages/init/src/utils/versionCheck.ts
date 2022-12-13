import { Models } from "@slicemachine/core";
import semver from "semver";

export function checkVersion(
  version: Models.Version,
  threshold: string
): boolean {
  if (!version) return false;
  const parsedVersion = semver.coerce(version);
  if (parsedVersion === null) return false;

  return semver.satisfies(parsedVersion, threshold);
}
