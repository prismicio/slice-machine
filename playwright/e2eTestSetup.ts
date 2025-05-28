import assert from "assert";
import dotenv from "dotenv";
import { createHash } from "crypto";
import { homedir } from "node:os";
import fs from "node:fs/promises";
import { createRepositoriesManager } from "@prismicio/e2e-tests-utils";

import { handleUncaughtException, exec } from "../scripts/utils/commandUtils";
import { auth, baseUrl, REPOSITORY_NAME_PREFIX } from "./playwright.config";

dotenv.config({ path: ".env.test.local", override: true });

const PRISMIC_FILE_PATH = `${homedir()}/.prismic`;

void main();

/**
 * This function is used to setup the environment for the E2E tests.
 * It cannot be part of `globalSetup.ts` because it needs to be executed before starting web servers.
 */
async function main(): Promise<void> {
  process.on("uncaughtException", handleUncaughtException);

  assert.ok(auth.username, "Missing PLAYWRIGHT_ADMIN_USERNAME env variable.");
  assert.ok(auth.password, "Missing PLAYWRIGHT_ADMIN_PASSWORD env variable.");

  const testUtils = createRepositoriesManager({
    urlConfig: baseUrl,
    authConfig: { email: auth.username, password: auth.password },
  });
  const userApiToken = await testUtils.getUserApiToken();

  await fs.writeFile(
    PRISMIC_FILE_PATH,
    JSON.stringify({
      base: baseUrl,
      cookies: `prismic-auth=${userApiToken}; Path=/; SameSite=None; SESSION=fake_session`,
    }),
  );
  const environment = process.env["SM_ENV"] || "dev-tools";
  let repositoryName = process.env["REPOSITORY"];

  if (repositoryName) {
    console.log(
      `[setup] REPOSITORY is set, using existing repo (${repositoryName})`,
    );
  } else {
    repositoryName = `${REPOSITORY_NAME_PREFIX}${randomString()}`;

    console.log(
      `[setup] REPOSITORY is not set, creating new repo (${repositoryName})`,
    );

    await exec(
      "yarn",
      [
        "play",
        "--no-start",
        "--environment",
        environment,
        "--prefix",
        REPOSITORY_NAME_PREFIX,
        "--new",
        repositoryName,
      ],
      {
        cwd: "..",
        stdio: "inherit",
      },
    );

    // Disable telemetry (Segment / Amplitude) for the newly created playground
    await fs.writeFile(
      `../playgrounds/${repositoryName}/.prismicrc`,
      "telemetry=false",
    );

    // Logout user by default (This is to avoid flaky tests)
    try {
      await fs.rm(PRISMIC_FILE_PATH);
    } catch (error) {
      // Ignore since it means the user is already logged out
    }

    // Save the name of the newly created repo into a file so it can be accessed
    // by playwright globalTeardown that is in a separate process
    await fs.writeFile(".repository-name", repositoryName);
  }

  process.off("uncaughtException", handleUncaughtException);
}

const randomString = (length = 16): string => {
  const uniqueInput = Math.random().toString();

  return createHash("md5").update(uniqueInput).digest("hex").slice(0, length);
};
