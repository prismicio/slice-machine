import fs from "node:fs/promises";
import { createRepositoriesManager } from "@prismicio/e2e-tests-utils";

import { auth, baseUrl, cluster } from "./playwright.config";

async function globalTeardown() {
  // Read the name of the repository from the file created by `e2eTestSetup.ts`
  // If the file does not exist, it means that no repository was created, so we don't need to delete anything
  const repository = await fs
    .readFile(".repository-name", "utf-8")
    .catch(() => undefined);

  if (!repository) {
    console.log("[teardown] no repository to delete");
    return;
  }

  console.log(`[teardown] deleting created repository (${repository})`);

  const testUtils = createRepositoriesManager({
    urlConfig: baseUrl,
    authConfig: { email: auth.username, password: auth.password },
    cluster,
  });

  await fs.rm(".repository-name");
  await testUtils.deleteRepository(repository);
  await fs.rm(`../playgrounds/${repository}`, { recursive: true });
}

export default globalTeardown;
