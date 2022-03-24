import { retrieveManifest } from "@slicemachine/core/build/node-utils";
import { migrate } from "../migration/migrate";

export async function handleMigration(cwd: string): Promise<void> {
  if (!retrieveManifest(cwd).exists) return;

  try {
    await migrate({ cwd, ignorePromptForTest: false });
  } catch (e: unknown) {
    console.error(
      "An error occurred while migrating file system. Continuing..."
    );
    console.error(`Full error: ${JSON.stringify(e)}`);
    return;
  }
}
