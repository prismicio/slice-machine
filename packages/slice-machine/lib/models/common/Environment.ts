import PrismicData from "./PrismicData";
import UserConfig from "./UserConfig";
import { Framework } from "./Framework";
import DefaultClient from "./http/DefaultClient";
import FakeClient from "./http/FakeClient";

export interface UpdateVersionInfo {
  currentVersion: string;
  latestVersion: string;
  packageManager: "npm" | "yarn";
  updateCommand: string;
  updateAvailable: boolean;
}

export default interface BackendEnvironment {
  userConfig: UserConfig;
  repo?: string;
  updateVersionInfo: UpdateVersionInfo;
  mockConfig: any;
  framework: Framework;
  baseUrl: string;
  cwd: string;
  prismicData: PrismicData;
  client: DefaultClient | FakeClient;
}

export interface FrontEndEnvironment {
  userConfig: UserConfig;
  repo?: string;
  updateVersionInfo: UpdateVersionInfo;
  mockConfig: any;
  framework: Framework;
  sliceMachineAPIUrl: string;
  prismicAPIUrl: string;
}
