import PrismicData from "./PrismicData";
import type { Models } from "@slicemachine/core";
import DefaultClient from "./http/DefaultClient";
import FakeClient from "./http/FakeClient";
import { PackageChangelog } from "./versions";

export interface BackendEnvironment {
  cwd: string;
  prismicData: PrismicData;
  manifest: Models.Manifest;
  repo?: string;
  changelog: PackageChangelog;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockConfig: any;
  framework: Models.Frameworks;
  baseUrl: string;
  // Here to replace the fake client
  isUserLoggedIn: boolean;
  client: DefaultClient | FakeClient;
}

export interface FrontEndEnvironment {
  shortId?: string;
  manifest: Models.Manifest;
  repo?: string;
  changelog: PackageChangelog;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockConfig: any;
  framework: Models.Frameworks;
  sliceMachineAPIUrl: string;
}
