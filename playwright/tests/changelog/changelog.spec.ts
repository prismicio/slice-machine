import { expect } from "@playwright/test";

import { test } from "../../fixtures";

test.run()(
  "I can see a warning if the selected release note has a breaking changes",
  async ({ changelogPage, procedures }) => {
    const releaseNotes =
      "Breaking Changes - This changes is breaking your slice machine";
    procedures.mock(
      "versions.getAllStableSliceMachineVersionsWithKind",
      () => [
        {
          version: "2.0.0",
          kind: "MAJOR",
        },
      ],
      { execute: false },
    );
    procedures.mock(
      "versions.getSliceMachineReleaseNotesForVersion",
      () => `# ${releaseNotes}`,
      { execute: false },
    );

    await changelogPage.goto();
    await changelogPage.checkReleaseNotes(releaseNotes);
    await expect(changelogPage.breakingChangesWarning).toBeVisible();
  },
);

test.run()(
  "I cannot see a warning if the selected release does not contain a breaking change",
  async ({ changelogPage, procedures }) => {
    const releaseNotes = "This changes is not breaking your slice machine";
    procedures.mock(
      "versions.getAllStableSliceMachineVersionsWithKind",
      () => [
        {
          version: "2.0.0",
          kind: "MAJOR",
        },
        {
          version: "1.0.42",
          kind: "PATCH",
        },
      ],
      { execute: false },
    );
    procedures.mock(
      "versions.getSliceMachineReleaseNotesForVersion",
      () => releaseNotes,
      { execute: false },
    );

    await changelogPage.goto();
    await changelogPage.selectVersion("1.0.42");

    await changelogPage.checkReleaseNotes(releaseNotes);
    await expect(changelogPage.breakingChangesWarning).not.toBeVisible();
  },
);

test.run()(
  "I can see the yarn latest update command",
  async ({ changelogPage, procedures }) => {
    const packageManager = "yarn";
    const adapterName = "@slicemachine/adapter-next";
    procedures.mock("project.getAdapterName", () => adapterName, {
      execute: false,
    });
    procedures.mock("getState", ({ data }) => ({
      ...(data as Record<string, unknown>),
      env: {
        ...((data as Record<string, unknown>)["env"] as Record<
          string,
          unknown
        >),
        packageManager,
      },
    }));

    await changelogPage.goto();
    await expect(
      changelogPage.getUpdateCommand({
        packageManager,
        adapterName,
        version: "latest",
      }),
    ).toBeVisible();
  },
);

test.run()(
  "I can see the npm latest update command",
  async ({ changelogPage, procedures }) => {
    const packageManager = "npm";
    const adapterName = "@slicemachine/adapter-next";
    procedures.mock("project.getAdapterName", () => adapterName, {
      execute: false,
    });
    procedures.mock("getState", ({ data }) => ({
      ...(data as Record<string, unknown>),
      env: {
        ...((data as Record<string, unknown>)["env"] as Record<
          string,
          unknown
        >),
        packageManager,
      },
    }));

    await changelogPage.goto();
    await expect(
      changelogPage.getUpdateCommand({
        packageManager,
        adapterName,
        version: "latest",
      }),
    ).toBeVisible();
  },
);
