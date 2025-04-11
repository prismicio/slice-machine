import {
  createRepositoriesManager,
  type RepositoryConfig,
} from "@prismicio/e2e-tests-utils";

import {
  auth,
  baseUrl,
  manageV2Config,
  prismicCluster,
} from "./playwright.config";

import { setRepositoryEnvVar } from "./fixtures";

async function globalSetup() {
  const config: RepositoryConfig = {
    locales: ["en-us"],
    defaultLocale: "en-us",
    customTypes: [],
    slices: [],
  };

  const testUtils = createRepositoriesManager({
    urlConfig: baseUrl,
    authConfig: { email: auth.username, password: auth.password },
    manageV2Config,
    cluster: prismicCluster,
  });

  const repository = await testUtils.createRepository(config);

  // Inject the name of the newly created repo into the Env, so we can run the app pointing to it.
  setRepositoryEnvVar(repository.name);
}

export default globalSetup;
