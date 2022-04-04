import path from "path";
import * as NodeUtils from "@slicemachine/core/build/node-utils";

// Don't remove those lines, they resolve aliases
import { resolveAliases } from "../../lib/env/resolveAliases";
resolveAliases(path.join(__dirname, "../../../"));

import handleManifest, { ManifestInfo } from "@lib/env/manifest";
import { getPackageChangelog } from "@lib/env/versions";

import { findArgument } from "./findArgument";
import infoBox from "./infoxBox";
import { handleMigration } from "./handleMigration";
import { validateManifest } from "./validateManifest";
import { startSMServer } from "./startSMServer";
import { validateSession } from "./validateSession";

async function run(): Promise<void> {
  const cwd: string = process.cwd(); // project running the script
  const port: string =
    findArgument(process.argv, "pepe").value ||
    findArgument(process.argv, "port").value ||
    "9999";
  const skipMigration: boolean = findArgument(
    process.argv,
    "skipMigration"
  ).exists;

  if (!skipMigration) await handleMigration(cwd);

  const manifest: ManifestInfo = handleManifest(cwd);
  const { isManifestValid } = validateManifest(manifest);
  if (!isManifestValid) return process.exit(0);

  const smNodeModuleDirectory = path.resolve(__dirname, "../../..");
  const packageChangelog = await getPackageChangelog(smNodeModuleDirectory);

  const framework = NodeUtils.Framework.defineFramework({
    cwd,
    manifest: manifest.content || undefined,
  });

  const UserInfo = await validateSession(cwd);

  return startSMServer(cwd, port, (url: string) =>
    infoBox(packageChangelog.currentVersion, url, framework, UserInfo?.email)
  );
}

function start(): Promise<void> {
  return run().catch((err) => {
    console.error(`[slice-machine] An unexpected error occurred. Exiting...`);
    console.error("Full error: ", err);
  });
}

export default start;

const isCli = require.main === module;

if (isCli) {
  void start();
}
