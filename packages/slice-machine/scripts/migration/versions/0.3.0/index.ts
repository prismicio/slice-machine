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
      let previousFramework = null;

      if (framework === Models.Frameworks.next) {
        previousFramework = Models.Frameworks.previousNext;
      }

      if (framework === Models.Frameworks.nuxt) {
        previousFramework = Models.Frameworks.previousNuxt;
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
