import boxen from "boxen";
import { CONSTS, Models } from "@slicemachine/core";
import { ManifestState, ManifestInfo } from "../../lib/env/manifest";
import chalk from "chalk";

export function validateManifest(manifest: ManifestInfo): {
  isManifestValid: boolean;
  warning: boolean;
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

  const warning =
    manifest.state === ManifestState.Valid &&
    manifest.content?.framework === Models.Frameworks.none;

  if (warning) {
    const frameworks = Object.values(Models.Frameworks).filter(
      (d) => d !== Models.Frameworks.none
    );

    const message = `\r\n🟡 Framework not set in sm.json. Please set "framework" to one of [ ${frameworks.join(
      ", "
    )} ]`;
    console.log(message);
  }

  switch (manifest.state) {
    case ManifestState.Valid:
      return { isManifestValid: true, warning };

    case ManifestState.NotFound: {
      console.log(
        `Run ${chalk.bold(
          `"${CONSTS.INIT_COMMAND}"`
        )} command to configure your project`
      );

      return { isManifestValid: false, warning };
    }

    case ManifestState.MissingEndpoint:
      console.log(
        'Add a property "apiEndpoint" to your config.\nExample: https://my-repo.prismic.io/api/v2\n\n'
      );
      return { isManifestValid: false, warning };

    case ManifestState.InvalidEndpoint:
      console.log(
        "Update your config file with a valid Prismic endpoint.\nExample: https://my-repo.prismic.io/api/v2\n\n"
      );
      return { isManifestValid: false, warning };

    case ManifestState.InvalidJson: {
      console.log("Update your config file with a valid JSON structure.");
      return { isManifestValid: false, warning };
    }

    default: {
      return { isManifestValid: true, warning };
    }
  }
}
