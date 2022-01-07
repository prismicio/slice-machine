import PrismicData from "./PrismicData";
import type { Models } from "@slicemachine/core";
import DefaultClient from "./http/DefaultClient";
import FakeClient from "./http/FakeClient";

export interface UpdateVersionInfo {
  currentVersion: string;
  latestVersion: string;
  packageManager: "npm" | "yarn";
  updateCommand: string;
  updateAvailable: boolean;
}

export interface BackendEnvironment {
  cwd: string;
  prismicData: PrismicData;
  manifest: Models.Manifest;
  repo?: string;
  updateVersionInfo: UpdateVersionInfo;
  mockConfig: any;
  framework: Models.Frameworks;
  baseUrl: string;
  client: DefaultClient | FakeClient;
}

export interface FrontEndEnvironment {
  manifest: Models.Manifest;
  repo?: string;
  updateVersionInfo: UpdateVersionInfo;
  mockConfig: any;
  framework: Models.Frameworks;
  sliceMachineAPIUrl: string;
  prismicAPIUrl: string;
}
