import {
  createRepositoriesManager,
  type RepositoryConfig,
} from "@prismicio/e2e-tests-utils";

import { auth, baseUrl, cluster } from "./playwright.config";

import { setRepositoryEnvVar } from "./fixtures";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

type SlicemachineConfig = {
  repositoryName: string;
  apiEndpoint: string;
};

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

  const fileRead = readFileSync(
    path.resolve(__dirname, "../e2e-projects/next/slicemachine.config.json"),
    "utf8",
  );

  const smConfig = JSON.parse(fileRead) as SlicemachineConfig;

  const hostname = new URL(baseUrl).hostname;
  smConfig.repositoryName = repository.name;
  smConfig.apiEndpoint = `https://${repository.name}.cdn.${hostname}/api/v2`;

  writeFileSync(
    path.resolve(__dirname, "../e2e-projects/next/slicemachine.config.json"),
    JSON.stringify(smConfig, null, 2),
  );
}

export default globalSetup;
