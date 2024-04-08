import type { APIEndpoints, PackageManager } from "@slicemachine/manager";

import type { Manifest } from "./Manifest";
import PrismicData from "./PrismicData";

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
