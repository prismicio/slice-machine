import PrismicData from "./PrismicData";
import type { Models } from "@slicemachine/core";
import { PackageChangelog } from "./versions";
import { PackageManager } from "./PackageManager";
import { CustomTypeMockConfig } from "./MockConfig";

export interface BackendEnvironment {
  cwd: string;
  prismicData: PrismicData;
  manifest: Models.Manifest;
  repo: string;
  mockConfig: CustomTypeMockConfig;
  framework: Models.Frameworks;
  baseUrl: string;
}

export interface FrontEndEnvironment {
  shortId?: string;
  intercomHash?: string;
  manifest: Models.Manifest;
  repo: string;
  changelog?: PackageChangelog;
  packageManager: PackageManager;
  mockConfig: CustomTypeMockConfig;
  framework: Models.Frameworks;
  sliceMachineAPIUrl: string;
}
