import PrismicData from "./PrismicData";
import type { Models } from "@slicemachine/core";
import { PackageChangelog } from "./versions";
import { PackageManager } from "./PackageManager";

import { ApplicationMode } from "../server/ApplicationMode";
import { Client } from "../server/Client";

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
