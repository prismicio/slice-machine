import path from "path";
import { Utils, Models } from "@slicemachine/core";

import handleManifest, { ManifestInfo } from "../../lib/env/manifest";
import compareVersions from "../../lib/env/semver";
import { validateUserAuth } from "../../server/src/api/services/validateUserAuth";

import { findArgument } from "../common/findArgument";
import infoBox from "./infoxBox";
import { handleMigration } from "./handleMigration";
import { validateManifest } from "./validateManifest";
import { startSMServer } from "./startSMServer";

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
  if (!isManifestValid) process.exit(0);

  const SmDirectory = path.resolve(__dirname, "..");
  const npmCompareData = await compareVersions({ cwd: SmDirectory });

  const framework = Utils.Framework.defineFramework(
    manifest.content,
    cwd,
    Models.SupportedFrameworks
  );
  const validateRes = await validateUserAuth();

  return startSMServer(cwd, port, (url: string) => {
    const email: string | undefined = validateRes.body
      ? (validateRes.body as { email: string }).email
      : undefined;
    infoBox(npmCompareData, url, framework, email);
  });
}

run().catch((err) => {
  console.error(`[slice-machine] An unexpected error occurred. Exiting...`);
  console.error("Full error: ", err);
});
