import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import {
  experimentVariant,
  gitOwners,
  gitRepos,
  linkedRepos,
  providerAppInstallURL,
} from "../../mocks";
import {
  SliceMachineError,
  UnauthenticatedError,
  UnauthorizedError,
} from "../../utils";

test("I can install the GitHub app", async ({ procedures, settingsPage }) => {
  procedures.mock("telemetry.getExperimentVariant", () => experimentVariant, {
    execute: false,
  });
  procedures.mock("git.fetchLinkedRepos", () => [], { execute: false });
  procedures.mock("git.fetchOwners", () => [], { execute: false });

  await settingsPage.goto();

  procedures.mock("git.getProviderAppInstallURL", () => providerAppInstallURL, {
    execute: false,
  });

  const gitHubPagePromise = settingsPage.page.context().waitForEvent("page");
  await settingsPage.installGitHubButton.click();
  const gitHubPage = await gitHubPagePromise;
  await gitHubPage.waitForLoadState();
  expect(await gitHubPage.title()).toBe("Sign in to GitHub · GitHub");
});

test("I can connect a GitHub repository to my Prismic repository", async ({
  procedures,
  settingsPage,
}) => {
  procedures.mock("telemetry.getExperimentVariant", () => experimentVariant, {
    execute: false,
  });
  procedures.mock("git.fetchLinkedRepos", () => [], { execute: false });
  procedures.mock("git.fetchOwners", () => gitOwners, { execute: false });
  procedures.mock("git.fetchRepos", () => gitRepos, { execute: false });

  await settingsPage.goto();

  const firstGitRepo = gitRepos[0];
  await settingsPage.getConnectGitRepoButton(firstGitRepo.name).click();

  procedures.mock("git.linkRepo", () => undefined, { execute: false });
  procedures.mock("git.updateWriteAPIToken", () => undefined, {
    execute: false,
  });
  procedures.mock("git.fetchLinkedRepos", () => [firstGitRepo], {
    execute: false,
  });

  await settingsPage.gitRepositoryConnectDialog.connect("Write API token");
  await expect(
    settingsPage.getDisconnectGitRepoButton(firstGitRepo.name),
  ).toBeVisible();
});

test("I can disconnect a GitHub repository from my Prismic repository", async ({
  procedures,
  settingsPage,
}) => {
  procedures.mock("telemetry.getExperimentVariant", () => experimentVariant, {
    execute: false,
  });
  procedures.mock("git.fetchLinkedRepos", () => linkedRepos, {
    execute: false,
  });

  await settingsPage.goto();

  const firstLinkedRepo = linkedRepos[0];
  await settingsPage.getDisconnectGitRepoButton(firstLinkedRepo.name).click();

  procedures.mock("git.unlinkRepo", () => undefined, { execute: false });
  procedures.mock("git.fetchLinkedRepos", () => [], { execute: false });
  procedures.mock("git.fetchOwners", () => gitOwners, { execute: false });
  procedures.mock("git.fetchRepos", () => [firstLinkedRepo], {
    execute: false,
  });

  await settingsPage.gitRepositoryDisconnectDialog.disconnect();
  await expect(
    settingsPage.getConnectGitRepoButton(firstLinkedRepo.name),
  ).toBeVisible();
});

test("I can see a specific error message when I'm unauthenticated", async ({
  procedures,
  settingsPage,
}) => {
  procedures.mock("telemetry.getExperimentVariant", () => experimentVariant, {
    execute: false,
  });
  procedures.mock(
    "git.fetchLinkedRepos",
    () => {
      throw new UnauthenticatedError();
    },
    { execute: false },
  );

  await settingsPage.goto();

  await expect(settingsPage.unauthenticatedErrorTitle).toBeVisible();
});

test("I can see a specific error message when I'm unauthorized", async ({
  procedures,
  settingsPage,
}) => {
  procedures.mock("telemetry.getExperimentVariant", () => experimentVariant, {
    execute: false,
  });
  procedures.mock(
    "git.fetchLinkedRepos",
    () => {
      throw new UnauthorizedError();
    },
    { execute: false },
  );

  await settingsPage.goto();

  await expect(settingsPage.unauthorizedErrorTitle).toBeVisible();
});

test("I can see a generic error message when something unexpected happened", async ({
  procedures,
  settingsPage,
}) => {
  procedures.mock("telemetry.getExperimentVariant", () => experimentVariant, {
    execute: false,
  });
  procedures.mock(
    "git.fetchLinkedRepos",
    () => {
      throw new SliceMachineError();
    },
    { execute: false },
  );

  await settingsPage.goto();

  await expect(settingsPage.unknownErrorTitle).toBeVisible();
});

test("I can't navigate to the settings page if I'm not eligible to the `slicemachine-git-integration` experiment", async ({
  procedures,
  sliceMachinePage,
}) => {
  procedures.mock("telemetry.getExperimentVariant", () => undefined, {
    execute: false,
  });

  await sliceMachinePage.gotoDefaultPage();

  await expect(sliceMachinePage.menu.settingsLink).not.toBeVisible();
});
