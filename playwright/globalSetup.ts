import {
  createRepositoriesManager,
  type RepositoryConfig,
} from "@prismicio/e2e-tests-utils";

import { auth, baseUrl, cluster } from "./playwright.config";

import { setRepositoryEnvVar } from "./fixtures";

async function globalSetup() {
  // if E2E_REPOSITORY is set, it's because we want to use an existing repo
  const existingRepo = process.env["E2E_REPOSITORY"];
  if (existingRepo) {
    console.log(
      `[setup] E2E_REPOSITORY is set, using existing repo (${existingRepo})`,
    );
    return;
  }

  const config: RepositoryConfig = {
    locales: ["en-us"],
    defaultLocale: "en-us",
    customTypes: [],
    slices: [],
  };

  const testUtils = createRepositoriesManager({
    urlConfig: baseUrl,
    authConfig: { email: auth.username, password: auth.password },
    cluster,
  });

  const repository = await testUtils.createRepository(config);

  // Inject the name of the newly created repo into the Env, so we can run the app pointing to it.
  setRepositoryEnvVar(repository.name);
}

export default globalSetup;
