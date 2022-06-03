import { BackendEnvironment } from "@lib/models/common/Environment";
import { ApplicationMode } from "@lib/models/server/ApplicationMode";
import { Client } from "@lib/models/server/Client";
import { Frameworks } from "@slicemachine/core/build/models";

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
