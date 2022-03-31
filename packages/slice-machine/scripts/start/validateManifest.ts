import boxen from "boxen";
import { CONSTS, Models } from "@slicemachine/core";
import { ManifestState, ManifestInfo } from "../../lib/env/manifest";
import chalk from "chalk";

export function validateManifest(manifest: ManifestInfo): {
  isManifestValid: boolean;
} {
  if (manifest.state !== ManifestState.Valid) {
    console.log(
      boxen(
        `🔴 A configuration error was detected!

Error Message:
"${manifest.message}"

See below for more info 👇`,
        { padding: 1, borderColor: "red" }
      )
    );

    console.log("\n--- ℹ️  How to solve this: ---\n");
  }

  if (
    manifest.state === ManifestState.Valid &&
    manifest.content?.framework === Models.Frameworks.none
  ) {
    const frameworks = Object.values(Models.Frameworks).filter(
      (d) => d !== Models.Frameworks.none
    );
    const message = boxen(
      `🟡 Framework not set in sm.json.
Please set "framework" to one of [ ${frameworks.join(", ")} ]
`,
      { padding: 1, borderColor: "yellow" }
    );
    console.log(message);
  }

  switch (manifest.state) {
    case ManifestState.Valid:
      return { isManifestValid: true };

    case ManifestState.NotFound: {
      console.log(
        `Run ${chalk.bold(
          `"${CONSTS.INIT_COMMAND}"`
        )} command to configure your project`
      );

      return { isManifestValid: false };
    }

    case ManifestState.MissingEndpoint:
      console.log(
        'Add a property "apiEndpoint" to your config.\nExample: https://my-repo.prismic.io/api/v2\n\n'
      );
      return { isManifestValid: false };

    case ManifestState.InvalidEndpoint:
      console.log(
        "Update your config file with a valid Prismic endpoint.\nExample: https://my-repo.prismic.io/api/v2\n\n"
      );
      return { isManifestValid: false };

    case ManifestState.InvalidJson: {
      console.log("Update your config file with a valid JSON structure.");
      return { isManifestValid: false };
    }

    default: {
      return { isManifestValid: true };
    }
  }
}
