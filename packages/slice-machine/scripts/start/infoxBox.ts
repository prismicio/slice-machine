import dedent from "dedent";
import boxen from "boxen";
import { Comparison } from "../../lib/env/semver";

export default function infoBox(
  npmCompare: Comparison,
  port: string,
  framework: string,
  userEmail?: string
) {
  const hasUpdate = npmCompare.updateAvailable;
  if (!npmCompare.currentVersion) {
    console.error(
      "Could not fetch package versions. Are you connected to internet?"
    );
    return;
  }

  console.log(
    boxen(
      dedent(`🍕 SliceMachine ${
        npmCompare.currentVersion.split("-")[0]
      } started.
        ${
          hasUpdate && npmCompare.onlinePackage
            ? `
          A new version (${npmCompare.onlinePackage.version}) is available!
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
