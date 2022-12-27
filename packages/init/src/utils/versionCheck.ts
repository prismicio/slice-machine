import semverCoerce from "semver/functions/coerce";
import semverSatisfies from "semver/functions/satisfies";

export function checkVersion(threshold: string, version?: string): boolean {
  if (!version) return false;
  const parsedVersion = semverCoerce(version);
  if (parsedVersion === null) return false;

  return semverSatisfies(parsedVersion, threshold);
}
