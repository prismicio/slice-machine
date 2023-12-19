import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { mockManagerProcedures } from "../../utils";

test.describe("Changelog", () => {
  test.run()(
    "I can see a warning if the selected release note has a breaking changes",
    async ({ changelogPage }) => {
      const releaseNotes =
        "Breaking Changes - This changes is breaking your slice machine";
      await mockManagerProcedures({
        page: changelogPage.page,
        procedures: [
          {
            path: "versions.getAllStableSliceMachineVersionsWithKind",
            data: () => [
              {
                version: "2.0.0",
                kind: "MAJOR",
              },
            ],
            execute: false,
          },
          {
            path: "versions.getSliceMachineReleaseNotesForVersion",
            data: () => `# ${releaseNotes}`,
            execute: false,
          },
        ],
      });

      await changelogPage.goto();

      await changelogPage.checkReleaseNotes(releaseNotes);
      await expect(changelogPage.breakingChangesWarning).toBeVisible();
    },
  );

  test.run()(
    "I cannot see a warning if the selected release note don't have a breaking changes",
    async ({ changelogPage }) => {
      const releaseNotes = "This changes is not breaking your slice machine";
      await mockManagerProcedures({
        page: changelogPage.page,
        procedures: [
          {
            path: "versions.getAllStableSliceMachineVersionsWithKind",
            data: () => [
              {
                version: "2.0.0",
                kind: "MAJOR",
              },
              {
                version: "1.0.42",
                kind: "PATCH",
              },
            ],
            execute: false,
          },
          {
            path: "versions.getSliceMachineReleaseNotesForVersion",
            data: () => releaseNotes,
            execute: false,
          },
        ],
      });

      await changelogPage.goto();
      await changelogPage.selectVersion("1.0.42");

      await changelogPage.checkReleaseNotes(releaseNotes);
      await expect(changelogPage.breakingChangesWarning).not.toBeVisible();
    },
  );
});
