import { Models } from "@slicemachine/core";
import { Client, ApplicationMode } from "@slicemachine/client";
import { Framework } from "@slicemachine/core/build/node-utils";

import type { BackendEnvironment } from "@lib/models/common/Environment";
import type { ConfigErrors } from "@lib/models/server/ServerState";
import { getPackageChangelog } from "@lib/env/versions";
import { getConfig as getMockConfig } from "@lib/mock/misc/fs";
import handleManifest, { ManifestState, ManifestInfo } from "@lib/env/manifest";

import getPrismicData from "./getPrismicData";
import { Manifest } from "@slicemachine/core/build/models";

// variable declared globally on the index.ts, is the cwd to SM dependency
declare let appRoot: string;

function validate(config: Models.Manifest): ConfigErrors {
  const errors: ConfigErrors = {};

  if (
    config.framework &&
    !Framework.isFrameworkSupported(Models.Frameworks[config.framework])
  ) {
    const options = Object.values(Models.SupportedFrameworks);

    errors.framework = {
      message: `The framework set in sm.json is invalid`,
      example: "react",
      run: `Set framework to one of the following: ${options.join(", ")}`,
    };
  }

  return errors;
}

function extractRepo(apiEndpoint: Manifest["apiEndpoint"]): string {
  try {
    const url = new URL(apiEndpoint);
    const host = url.host; // myrepo.prismic.io
    const repository = host.split(".")[0]; // myrepo
    return repository;
  } catch (e) {
    // Should already be covered by the start script.
    console.error(
      "It seems your repository API endpoint in your SM.json is wrong. Please start machine again to get instructions on how to fix it."
    );
    process.exit(0);
  }
}

export function getApplicationMode(
  apiEndpoint: Models.Manifest["apiEndpoint"]
): ApplicationMode {
  if (apiEndpoint.includes("prismic.io")) return ApplicationMode.PROD;
  else if (apiEndpoint.includes("wroom.io")) return ApplicationMode.STAGE;
  else if (apiEndpoint.includes("wroom.test")) return ApplicationMode.DEV;
  else throw new Error(`Unknown application mode for ${apiEndpoint}`);
}

export default async function getEnv(
  maybeCustomCwd?: string
): Promise<{ errors: ConfigErrors; env: BackendEnvironment }> {
  const cwd = maybeCustomCwd || process.env.CWD || process.cwd();
  if (!cwd) {
    const message =
      "[api/env]: Unrecoverable error. Could not find cwd. Exiting..";
    console.error(message);
    throw new Error(message);
  }
  // we'll need to do somthing about this inorder to send error messages to the browser.
  const manifestInfo: ManifestInfo = handleManifest(cwd);
  if (manifestInfo.state !== ManifestState.Valid || !manifestInfo.content) {
    console.error(manifestInfo.message);
    throw new Error(manifestInfo.message);
  }

  const applicationMode: ApplicationMode = getApplicationMode(
    manifestInfo.content.apiEndpoint
  );

  const prismicData = getPrismicData();

  if (!prismicData.isOk()) {
    const message =
      "[api/env]: Unrecoverable error. ~/.prismic file unreadable";
    console.error(message);
    throw new Error(message);
  }

  const smChangelog = await getPackageChangelog(appRoot);

  const maybeErrors = validate(manifestInfo.content);

  const repository = extractRepo(manifestInfo.content.apiEndpoint);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const mockConfig = getMockConfig(cwd);

  const client = new Client(
    applicationMode,
    repository,
    prismicData.value.auth || ""
  );

  return {
    errors: maybeErrors,
    env: {
      applicationMode,
      cwd,
      repo: repository,
      manifest: manifestInfo.content,
      prismicData: prismicData.value,
      changelog: smChangelog,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      mockConfig,
      framework: Framework.defineFramework({
        cwd,
        manifest: manifestInfo.content,
      }),
      baseUrl: `http://localhost:${process.env.PORT || "9999"}`,
      client,
    },
  };
}
