import fs from "fs";
import path from "path";
import glob from "glob";
import slash from "slash";
import * as NodeUtils from "@prismic-beta/slicemachine-core/build/node-utils";
import * as Libraries from "@prismic-beta/slicemachine-core/build/libraries";
import { Migration } from "../../migrate";
import prompts from "prompts";

// Migration to move the old screenshots to the .slicemachine folder
const migration: Migration = {
  version: "0.0.41",
  main: async function main({ cwd, ignorePromptForTest }): Promise<void> {
    console.info(
      "\nSliceMachine now supports both default and custom previews (screenshots)!"
    );
    console.info(
      "Default screenshots are now stored in a special .slicemachine folder."
    );

    if (!ignorePromptForTest) {
      const doTheMigration = await shouldIRun(
        "Would you like me to move current previews to .slicemachine folder?"
      );
      if (!doTheMigration.yes) return;
    }

    const manifest = NodeUtils.retrieveManifest(cwd);
    if (!manifest.exists || !manifest.content) return;

    try {
      fs.mkdirSync(path.join(cwd, ".slicemachine", "assets"), {
        recursive: true,
      });

      const { libraries } = manifest.content;
      if (!libraries) return;
      libraries.forEach((lib: string) => {
        const { isLocal, pathExists, pathToSlices } = Libraries.getInfoFromPath(
          cwd,
          lib
        );
        if (!(isLocal && pathExists)) return;

        // match old previews
        const matches = glob.sync(`${slash(pathToSlices)}/**/preview.png`);

        // move the old previews to the .slicemachine folder
        matches.forEach((match) => {
          const split = match.split(path.posix.sep);
          const sliceName = split[split.length - 2];

          if (sliceName) {
            const pathToNewFile = path.join(
              cwd,
              ".slicemachine/assets",
              split[split.length - 3],
              sliceName,
              "preview.png"
            );

            // make the directory if it doesn't exist
            fs.mkdirSync(path.dirname(pathToNewFile), {
              recursive: true,
            });

            // move the screenshot
            fs.renameSync(match, pathToNewFile);
          }
        });
      });
    } catch (e) {
      console.log(e);
    }
  },
};

function shouldIRun(message: string): Promise<{ yes: boolean }> {
  return prompts({
    type: "select",
    name: "yes",
    message,
    choices: [
      { title: "Yes", value: true },
      { title: "No (skip)", value: false },
    ],
    initial: 0,
  });
}

export default migration;
