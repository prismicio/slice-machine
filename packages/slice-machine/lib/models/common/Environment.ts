import PrismicData from "./PrismicData";
import UserConfig from "./UserConfig";
import Chromatic from "./Chromatic";
import { Framework } from "./Framework";
import DefaultClient from "./http/DefaultClient";
import FakeClient from "./http/FakeClient";
import PackageVersion from "./PackageVersion";

export interface UpdateVersionInfo {
  currentVersion: string;
  latestVersion: string;
  packageManager: "npm" | "yarn";
  updateCommand: string;
  updateAvailable: boolean;
}

export default interface Environment {
  cwd: string;
  userConfig: UserConfig;
  hasConfigFile: boolean;
  repo?: string;
  prismicData: PrismicData;
  chromatic?: Chromatic;
  updateVersionInfo: UpdateVersionInfo;
  updateAvailable?: PackageVersion;
  mockConfig: any;
  framework: Framework;
  baseUrl: string;
  hasGeneratedStoriesPath: boolean;
  client: DefaultClient | FakeClient;
}
