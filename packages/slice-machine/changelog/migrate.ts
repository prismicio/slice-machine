import compareVersions from "compare-versions";
import { FileSystem } from "@slicemachine/core";

import MIGRATIONS from "./versions";
import { run } from "./run";

export interface Migration {
  version: string;
  main: (params: MigrationParams) => Promise<void>;
}

export interface MigrationParams {
  cwd: string;
  ignorePrompt: boolean;
}

// on postinstall of slicemachine UI, set the _latest the current version if doesn't exist yet.
export async function migrate(params: MigrationParams) {
  const projectCWD = params.cwd;
  const smConfig = FileSystem.retrieveManifest(projectCWD);

  const latestMigrationVersion: string | undefined = smConfig.content?._latest;

  const migrationsToRun: Migration[] = MIGRATIONS.filter((m) => {
    return compareVersions.compare(
      m.version,
      latestMigrationVersion || "0.0.41",
      ">"
    );
  });

  if (!migrationsToRun.length) return;
  return run(migrationsToRun, params);
}
