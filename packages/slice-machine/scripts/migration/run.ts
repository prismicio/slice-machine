import { FileSystem } from "@slicemachine/core";
import { Migration, MigrationParams } from "./migrate";

export async function run(
  migrations: readonly Migration[],
  params: MigrationParams
): Promise<void> {
  if (migrations.length === 0) {
    console.info(
      `All migrations were executed. You're ready to start working!`
    );
    return;
  }

  const [head, ...tail] = migrations;

  // run migration
  return head
    .main(params)
    .then(() => {
      console.info(
        `Migration ${head.version} done. Read the full changelog for more info!`
      );
      // update last migration version
      FileSystem.patchManifest(params.cwd, { _latest: head.version });

      // call next migrations
      return run(tail, params);
    })
    .catch((e: unknown) => {
      console.error(e);
    });
}
