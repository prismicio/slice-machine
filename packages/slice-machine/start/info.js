const dedent = require("dedent");
const boxen = require("boxen");

function infoBox(npmCompare, localhost, framework, email) {
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
        Logged in as:      ${email || "Not logged in"}
        Running on:        ${localhost}

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
