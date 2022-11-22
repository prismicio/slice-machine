import PrismicData from "./PrismicData";
import type { Models } from "@prismic-beta/slicemachine-core";
import type { Client, ApplicationMode } from "@slicemachine/client";
import { PackageChangelog } from "./versions";
import { PackageManager } from "./PackageManager";
import { CustomTypeMockConfig } from "./MockConfig";

export interface BackendEnvironment {
  applicationMode: ApplicationMode;
  cwd: string;
  prismicData: PrismicData;
  manifest: Models.Manifest;
  repo: string;
  changelog: PackageChangelog;
  mockConfig: CustomTypeMockConfig;
  framework: Models.Frameworks;
  baseUrl: string;
  client: Client;
}

export interface FrontEndEnvironment {
  shortId?: string;
  intercomHash?: string;
  manifest: Models.Manifest;
  repo: string;
  changelog: PackageChangelog;
  packageManager: PackageManager;
  mockConfig: CustomTypeMockConfig;
  framework: Models.Frameworks;
  sliceMachineAPIUrl: string;
}
