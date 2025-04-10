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
    locales: ["en-us", "en-pl", "it-it"],
    defaultLocale: "en-us",
    preview: {
      name: "Preview",
      websiteURL: "https://prismic.io",
      resolverPath: "/preview",
    },
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

  // Changing plan to be able to add user
  await repository.changePlan("platinum");
}

export default globalSetup;
