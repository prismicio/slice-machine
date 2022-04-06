import { BackendEnvironment } from "@lib/models/common/Environment";
import FakeClient from "@lib/models/common/http/FakeClient";
import { Frameworks } from "@slicemachine/core/build/models";

const backendEnvironment: BackendEnvironment = {
  isUserLoggedIn: false,
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
  client: new FakeClient(),
};

export default backendEnvironment;
