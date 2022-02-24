import compareVersions from "compare-versions";
import { FileSystem } from "@slicemachine/core";

import MIGRATIONS from "./versions";
import { run } from "./run";

export interface Migration {
  version: string;
  main: (cwd: string) => Promise<void>;
}

// on postinstall of sliceMachine UI, set the _latest to the current version if it doesn't exist yet.
export async function migrate(cwd: string) {
  const smConfig = FileSystem.retrieveManifest(cwd);

  const latestMigrationVersion: string | undefined = smConfig.content?._latest;

  const migrationsToRun: Migration[] = MIGRATIONS.filter((m) => {
    return compareVersions.compare(
      m.version,
      latestMigrationVersion || "0.0.41",
      ">"
    );
  });

  if (!migrationsToRun.length) return;
  return run(migrationsToRun, cwd);
}
