import { BackendEnvironment } from "@lib/models/common/Environment";
import FakeClient from "@lib/models/common/http/FakeClient";
import { Frameworks } from "@slicemachine/core/build/src/models";

const backendEnvironment: BackendEnvironment = {
  isUserLoggedIn: false,
  cwd: ".",
  prismicData: {
    base: "https://fakebase.io",
  },
  manifest: {
    apiEndpoint: "https://myFakeRepo.prismic.io/api/v2",
    libraries: ["@slices"],
  },
  updateVersionInfo: {
    currentVersion: "0.2.0",
    latestVersion: "0.2.0",
    packageManager: "npm",
    updateCommand: "npm update ?",
    updateAvailable: true,
  },
  mockConfig: {},
  framework: Frameworks.next,
  baseUrl: "https://fakebase.io",
  client: new FakeClient(),
};

export default backendEnvironment;
