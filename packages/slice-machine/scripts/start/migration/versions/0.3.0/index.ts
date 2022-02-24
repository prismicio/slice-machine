import { FileSystem, Utils } from "@slicemachine/core";

import { Migration } from "../../migrate";
import { Frameworks } from "@slicemachine/core/build/src/models";

// Migration to move the old screenshots to the .slicemachine folder
const migration: Migration = {
  version: "0.3.0",
  main: function main({ cwd }): Promise<void> {
    try {
      const manifest = FileSystem.retrieveManifest(cwd);
      if (!manifest.exists || !manifest.content) return;

      const framework = Utils.Framework.defineFramework({ cwd });
      let previousFramework = null;

      if (framework === Frameworks.next) {
        previousFramework = Frameworks.previousNext;
      }

      if (framework === Frameworks.nuxt) {
        previousFramework = Frameworks.previousNuxt;
      }

      const patchedManifest = {
        ...manifest.content,
        ...(previousFramework ? { framework: previousFramework } : {}),
      };

      FileSystem.patchManifest(cwd, patchedManifest);
    } catch (e) {
      console.log(e);
    }
  },
};

export default migration;
