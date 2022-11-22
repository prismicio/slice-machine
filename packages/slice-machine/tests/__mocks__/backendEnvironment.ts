import { Client, ApplicationMode } from "@slicemachine/client";
import { BackendEnvironment } from "@lib/models/common/Environment";
import { Frameworks } from "@prismic-beta/slicemachine-core/build/models";

export const fakeAuthenticationToken = "fakeAuthenticationToken";

const backendEnvironment: BackendEnvironment = {
  applicationMode: ApplicationMode.PROD,
  cwd: "/test",
  manifest: {
    apiEndpoint: "https://myFakeRepo.prismic.io/api/v2",
    libraries: ["@slices"],
  },
  prismicData: {},
  changelog: {
    currentVersion: "0.2.0",
    latestNonBreakingVersion: "0.2.0",
    updateAvailable: true,
    versions: [],
  },
  mockConfig: {},
  framework: Frameworks.next,
  baseUrl: "https://fakebase.io",
  repo: "fakeRepository",
  client: new Client(
    ApplicationMode.PROD,
    "fakeRepository",
    fakeAuthenticationToken
  ),
};

export default backendEnvironment;
