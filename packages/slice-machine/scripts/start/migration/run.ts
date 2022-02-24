import { FileSystem } from "@slicemachine/core";
import { Migration } from "./migrate";

export async function run(
  migrations: readonly Migration[],
  cwd: string
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
    .main(cwd)
    .then(() => {
      console.info(
        `Migration ${head.version} done. Read the full changelog for more info!`
      );
      // update last migration version
      FileSystem.patchManifest(cwd, { _latest: head.version });

      // call next migrations
      return run(tail, cwd);
    })
    .catch((e: unknown) => {
      console.error(e);
    });
}
