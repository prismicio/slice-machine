import PrismicData from "./PrismicData";
import type { Manifest } from "./Manifest";
import { PackageChangelog } from "./versions";
import { PackageManager } from "./PackageManager";
import { Frameworks } from "./Framework";

export interface BackendEnvironment {
  cwd: string;
  prismicData: PrismicData;
  manifest: Manifest;
  repo: string;
  framework: Frameworks;
  baseUrl: string;
}

export interface FrontEndEnvironment {
  shortId?: string;
  intercomHash?: string;
  manifest: Manifest;
  repo: string;
  changelog?: PackageChangelog;
  packageManager: PackageManager;
  framework: Frameworks;
}
