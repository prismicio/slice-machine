import { NodeUtils } from "@slicemachine/core";
import { migrate } from "../migration/migrate";

export async function handleMigration(cwd: string): Promise<void> {
  if (!NodeUtils.retrieveManifest(cwd).exists) return;

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
