import { FileSystem, Utils, Models } from "@slicemachine/core";

import { Migration } from "../../migrate";

// Migration to write previousNext or previousNuxt into the sm.json
const migration: Migration = {
  version: "0.3.0",
  // eslint-disable-next-line @typescript-eslint/require-await
  main: async function main({ cwd }): Promise<void> {
    try {
      const manifest = FileSystem.retrieveManifest(cwd);
      if (!manifest.exists || !manifest.content) return;

      const framework = Utils.Framework.defineFramework({ cwd });

      if (
        framework !== Models.Frameworks.next &&
        framework !== Models.Frameworks.nuxt
      ) {
        return;
      }

      const frameworkToSet =
        framework === Models.Frameworks.next
          ? Models.Frameworks.previousNext
          : Models.Frameworks.previousNuxt;

      const patchedManifest = {
        ...manifest.content,
        framework: frameworkToSet,
      };

      FileSystem.patchManifest(cwd, patchedManifest);
    } catch (e) {
      console.log(e);
    }
  },
};

export default migration;
