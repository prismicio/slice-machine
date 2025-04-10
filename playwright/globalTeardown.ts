import { createRepositoriesManager } from "@prismicio/e2e-tests-utils";

import { auth, baseUrl, prismicCluster } from "./playwright.config";
import { clearRepositoryEnvVar } from "./fixtures";

async function globalTeardown() {
  const testUtils = createRepositoriesManager({
    urlConfig: baseUrl,
    authConfig: { email: auth.username, password: auth.password },
    cluster: prismicCluster,
  });

  console.log("Tearing down E2E repo");
  await testUtils.tearDown();
  clearRepositoryEnvVar();
}

export default globalTeardown;
