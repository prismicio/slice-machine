import dedent from "dedent";
import boxen from "boxen";
import { PackageChangelog } from "@lib/models/common/versions";

export default function infoBox(
  packageChangelog: PackageChangelog,
  port: string,
  framework: string,
  userEmail?: string
) {
  const hasUpdate = packageChangelog.updateAvailable;
  if (!packageChangelog.currentVersion) {
    console.error("Could not get your current package versions.");
    return;
  }

  console.log(
    boxen(
      dedent(`🍕 SliceMachine ${
        packageChangelog.currentVersion.split("-")[0]
      } started.
        ${
          hasUpdate && packageChangelog.latestNonBreakingVersion
            ? `
          A new version (${packageChangelog.latestNonBreakingVersion}) is available!
          Upgrade now: yarn add slice-machine-ui@latest
        `
            : ""
        }
        Framework:         ${framework}
        Logged in as:      ${userEmail || "Not logged in"}
        Running on:        ${port}

      👇 Server logs will appear right here
      `),
      {
        padding: 1,
        borderColor: hasUpdate ? "red" : "green",
      }
    )
  );
}
