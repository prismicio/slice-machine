import semver from "semver";

export function checkVersion(threshold: string, version?: string): boolean {
  if (!version) return false;
  const parsedVersion = semver.coerce(version);
  if (parsedVersion === null) return false;

  return semver.satisfies(parsedVersion, threshold);
}
