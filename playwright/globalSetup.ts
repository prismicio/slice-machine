import {
  createRepositoriesManager,
  type RepositoryConfig,
} from "@prismicio/e2e-tests-utils";

import {
  auth,
  baseUrl,
  prismicCluster,
} from "./playwright.config";

import { setRepositoryEnvVar } from "./fixtures";

async function globalSetup() {
  // if E2E_REPOSITORY is set, it's because we want to use an existing repo
  if (process.env["E2E_REPOSITORY"]) return;

  const config: RepositoryConfig = {
    locales: ["en-us"],
    defaultLocale: "en-us",
    customTypes: [],
    slices: [],
  };

  const testUtils = createRepositoriesManager({
    urlConfig: baseUrl,
    authConfig: { email: auth.username, password: auth.password },
    cluster: prismicCluster,
  });

  const repository = await testUtils.createRepository(config);

  // Inject the name of the newly created repo into the Env, so we can run the app pointing to it.
  setRepositoryEnvVar(repository.name);
}

export default globalSetup;
