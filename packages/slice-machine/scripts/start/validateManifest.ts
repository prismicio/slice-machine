import boxen from "boxen";
import { CONSTS } from "@prismic-beta/slicemachine-core";
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

    case ManifestState.InvalidJson: {
      console.log("Update your config file with a valid JSON structure.");
      return { isManifestValid: false };
    }

    default: {
      return { isManifestValid: true };
    }
  }
}
