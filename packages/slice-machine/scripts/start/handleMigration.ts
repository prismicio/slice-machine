import fs from "fs";
import path from "path";
import migrate from "../../changelog/migrate";

export async function handleMigration(cwd: string): Promise<void> {
  const pathToPkg: string = path.join(cwd, "package.json");
  const pathToSmFile: string = path.join(cwd, "sm.json");
  if (!fs.existsSync(pathToSmFile)) return;

  try {
    await migrate(false, { cwd, pathToPkg, pathToSmFile });
  } catch (e: unknown) {
    console.error(
      "An error occurred while migrating file system. Continuing..."
    );
    console.error(`Full error: ${JSON.stringify(e)}`);
    return;
  }
}
