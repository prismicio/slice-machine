import compareVersions from "compare-versions";
import { NodeUtils } from "@slicemachine/core";

import MIGRATIONS from "./versions";
import { run } from "./run";

export interface Migration {
  version: string;
  main: (params: MigrationParams) => Promise<void>;
}

export interface MigrationParams {
  cwd: string;
  ignorePromptForTest: boolean;
}

// on postinstall of sliceMachine UI, set the _latest to the current version if it doesn't exist yet.
export async function migrate(params: MigrationParams) {
  const projectCWD = params.cwd;
  const smConfig = NodeUtils.retrieveManifest(projectCWD);

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
