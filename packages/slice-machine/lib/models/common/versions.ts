export const VersionKind = {
  MAJOR: "MAJOR",
  MINOR: "MINOR",
  PATCH: "PATCH",
  FIRST: "FIRST",
} as const;
export type VersionKind = typeof VersionKind[keyof typeof VersionKind];

// Model built from Npm version number and GitHub release note
export interface PackageVersion {
  versionNumber: string;
  releaseNote: string | null;
  kind: VersionKind | null;
}

// Release not fetch from GitHub
export interface ReleaseNote {
  name: string;
  body: string;
  draft: boolean;
}

export interface PackageChangelog {
  currentVersion: string;
  updateAvailable: boolean;
  latestNonBreakingVersion: string | null;
  versions: PackageVersion[];
}
