// Model built from Npm version number and Github release note
export interface PackageVersion {
  versionNumber: string;
  releaseNote: string | null;
}

// Release not fetch from github
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
