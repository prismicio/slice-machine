import PrismicData from "./PrismicData";
import type { Models } from "@slicemachine/core";
import type { Client, ApplicationMode } from "@slicemachine/client";
import { PackageChangelog } from "./versions";
import { PackageManager } from "./PackageManager";

export interface BackendEnvironment {
  applicationMode: ApplicationMode;
  cwd: string;
  prismicData: PrismicData;
  manifest: Models.Manifest;
  repo: string;
  changelog: PackageChangelog;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockConfig: any;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockConfig: any;
  framework: Models.Frameworks;
  sliceMachineAPIUrl: string;
}
