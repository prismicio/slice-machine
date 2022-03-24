import fs from "fs";
import path from "path";
import slash from "slash";
import { Migration } from "../../migrate";

import * as Libraries from "@slicemachine/core/build/libraries";
import * as NodeUtils from "@slicemachine/core/build/node-utils";
import { scopePreviewToDefaultVariation } from "./scopePreviewToDefaultVariation";
import { moveMocks } from "./moveMocks";
import { moveStories } from "./moveStories";

function migrateSlice(cwd: string, libraryName: string, sliceName: string) {
  scopePreviewToDefaultVariation(cwd, libraryName, sliceName);
  moveMocks(cwd, libraryName, sliceName);
  moveStories(cwd, libraryName, sliceName);
}

const migration: Migration = {
  version: "0.1.0",
  main: async function main({ cwd }) {
    // remove old mocks
    const pathToOldMocks = path.join(cwd, ".slicemachine", "mocks.json");
    if (NodeUtils.Files.exists(pathToOldMocks))
      NodeUtils.Files.remove(pathToOldMocks);

    const manifest = NodeUtils.retrieveManifest(cwd);

    if (manifest.exists && manifest.content) {
      const { libraries } = manifest.content;

      (libraries || []).forEach((lib: string) => {
        const { isLocal, pathExists, pathToSlices, pathToLib } =
          Libraries.getInfoFromPath(cwd, lib);

        if (isLocal && pathExists) {
          const libraryName = path.basename(pathToLib);
          const sliceNames = NodeUtils.Files.readDirectory(slash(pathToSlices))
            .map((curr: string) => path.join(pathToSlices, curr))
            .filter((e: string) => fs.statSync(e).isDirectory())
            .map((slicePath: string) => path.basename(slicePath));

          sliceNames.forEach((sliceName: string) => {
            migrateSlice(cwd, libraryName, sliceName);
          });
        }
      });
    }

    console.info("\nSliceMachine now supports variations!");
    console.info(
      "Generated mocks and Stories are now stored in the .slicemachine folder."
    );

    // returning a promise to match the type.
    return Promise.resolve();
  },
};

export default migration;
