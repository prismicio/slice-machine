export const VersionKind = {
  MAJOR: "MAJOR",
  MINOR: "MINOR",
  PATCH: "PATCH",
  FIRST: "FIRST",
} as const;
export type VersionKind = (typeof VersionKind)[keyof typeof VersionKind];

// Model built from Npm version number and GitHub release note
export interface PackageVersion {
  versionNumber: string;
  releaseNote: string | null;
  kind: VersionKind | undefined;
}

// Release not fetch from GitHub
export interface ReleaseNote {
  name: string;
  body: string;
  draft: boolean;
}

type SliceMachinePackageChangelog = {
  currentVersion: string;
  latestNonBreakingVersion: string | null;
  updateAvailable: boolean;
  versions: PackageVersion[];
};

type AdapterPackageChangelog = {
  name: string;
  updateAvailable: boolean;
  versions: string[];
};

export interface PackageChangelog {
  sliceMachine: SliceMachinePackageChangelog;
  adapter: AdapterPackageChangelog;
}
