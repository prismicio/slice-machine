import { retrieveManifest } from "@slicemachine/core/build/node-utils";
import { migrate } from "../migration/migrate";
import { Manifest } from "@slicemachine/core/build/models";

export async function handleMigration(
  cwd: string,
  manifest: Manifest
): Promise<void> {
  if (!retrieveManifest(cwd).exists) return;

  try {
    await migrate({ cwd, ignorePromptForTest: false }, manifest);
  } catch (e: unknown) {
    console.error(
      "An error occurred while migrating file system. Continuing..."
    );
    console.error(`Full error: ${JSON.stringify(e)}`);
    return;
  }
}
