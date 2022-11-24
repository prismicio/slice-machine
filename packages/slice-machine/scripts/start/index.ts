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
import { validateModels } from "./validateModels";
import { validateGenerateTypes } from "./validateGenerateTypes";
import { updateMocks } from "./udpateMocks";

async function run(): Promise<void> {
  const cwd: string = process.cwd(); // project running the script
  const port: string = findArgument(process.argv, "port").value || "9999";
  const skipMigration: boolean = findArgument(
    process.argv,
    "skipMigration"
  ).exists;

  const manifest: ManifestInfo = handleManifest(cwd, true);
  const { isManifestValid } = validateManifest(manifest);
  if (!isManifestValid || !manifest.content) return process.exit(0);

  if (!skipMigration) await handleMigration(cwd, manifest.content);

  const { areModelsValid } = validateModels({
    cwd,
    manifest: manifest.content,
  });
  if (!areModelsValid) return process.exit(0);

  validateGenerateTypes({ cwd });

  updateMocks(cwd, manifest.content.libraries);

  const framework = NodeUtils.Framework.defineFramework({
    cwd,
    manifest: manifest.content,
  });

  const smNodeModuleDirectory = path.resolve(__dirname, "../../..");
  const packageChangelog = await getPackageChangelog(smNodeModuleDirectory);

  const UserInfo = await validateSession(cwd);

  return startSMServer(cwd, port, (url: string) =>
    infoBox(packageChangelog.currentVersion, url, framework, UserInfo?.email)
  );
}

async function start(): Promise<void> {
  return run().catch((err) => {
    console.error(`[slice-machine] An unexpected error occurred. Exiting...`);
    console.error("Full error: ", err);
  });
}

export default start;
