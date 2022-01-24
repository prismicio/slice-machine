// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const dedent = require("dedent");
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires, @typescript-eslint/no-var-requires
const boxen = require("boxen");

function infoBox(npmCompare, localhost, framework, email) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const hasUpdate = npmCompare.updateAvailable;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (!npmCompare.currentVersion) {
    console.error(
      "Could not fetch package versions. Are you connected to internet?"
    );
    return;
  }

  console.log(
    boxen(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
      dedent(`🍕 SliceMachine ${
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        npmCompare.currentVersion.split("-")[0]
      } started.
        ${
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          hasUpdate && npmCompare.onlinePackage
            ? `
          A new version (${
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
            npmCompare.onlinePackage.version
          }) is available!
          Upgrade now: yarn add slice-machine-ui@latest
        `
            : ""
        }
        Framework:         ${
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions
          framework
        }
        Logged in as:      ${
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          email || "Not logged in"
        }
        Running on:        ${
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          localhost
        }

      👇 Server logs will appear right here
      `),
      {
        padding: 1,
        borderColor: hasUpdate ? "red" : "green",
      }
    )
  );
}

module.exports = infoBox;
