import PrismicData from "./PrismicData";
import UserConfig from "./UserConfig";
import Chromatic from "./Chromatic";
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

export default interface BackendEnvironment extends FrontEndEnvironment {
  cwd: string;
  prismicData: PrismicData;
  client: DefaultClient | FakeClient;
}

export interface FrontEndEnvironment {
  userConfig: UserConfig;
  repo?: string;
  chromatic?: Chromatic;
  updateVersionInfo: UpdateVersionInfo;
  mockConfig: any;
  framework: Framework;
  baseUrl: string;
  hasGeneratedStoriesPath: boolean;
  prismicData: {
    base: string;
  };
}
