import type { PackageManager, APIEndpoints } from "@slicemachine/manager";

import PrismicData from "./PrismicData";
import type { Manifest } from "./Manifest";

export interface BackendEnvironment {
  cwd: string;
  prismicData: PrismicData;
  manifest: Manifest;
  repo: string;
  baseUrl: string;
}

export interface FrontEndEnvironment {
  shortId?: string;
  intercomHash?: string;
  manifest: Manifest;
  repo: string;
  packageManager: PackageManager;
  endpoints: APIEndpoints;
}
