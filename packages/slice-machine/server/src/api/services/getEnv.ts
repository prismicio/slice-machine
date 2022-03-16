import {
  fromUrl,
  parseDomain,
  ParseResult,
  ParseResultType,
} from "parse-domain";

import getPrismicData from "./getPrismicData";

import { getConfig as getMockConfig } from "@lib/mock/misc/fs";
import handleManifest, { ManifestState, ManifestInfo } from "@lib/env/manifest";

import initClient from "@lib/models/common/http";
import { BackendEnvironment } from "@lib/models/common/Environment";
import { ConfigErrors } from "@lib/models/server/ServerState";
import { Models, NodeUtils } from "@slicemachine/core";
import preferWroomBase from "@lib/utils/preferWroomBase";
import { getPackageChangelog } from "@lib/env/versions";

// variable declared globally on the index.ts, is the cwd to SM dependency
declare let appRoot: string;

function validate(config: Models.Manifest): ConfigErrors {
  const errors: ConfigErrors = {};

  if (
    config.framework &&
    !NodeUtils.Framework.isFrameworkSupported(
      Models.Frameworks[config.framework]
    )
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

function extractRepo(parsedRepo: ParseResult): string | undefined {
  switch (parsedRepo.type) {
    case ParseResultType.Listed:
      if (parsedRepo.labels.length) {
        return parsedRepo.labels[0];
      }
      if (parsedRepo.subDomains.length) {
        return parsedRepo.subDomains[0];
      }
    default:
      return;
  }
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

  const manifestInfo: ManifestInfo = handleManifest(cwd);
  if (manifestInfo.state !== ManifestState.Valid || !manifestInfo.content) {
    console.error(manifestInfo.message);
    throw new Error(manifestInfo.message);
  }

  const base = preferWroomBase(manifestInfo.content.apiEndpoint);
  const prismicData = getPrismicData();

  if (!prismicData.isOk()) {
    const message =
      "[api/env]: Unrecoverable error. ~/.prismic file unreadable";
    console.error(message);
    throw new Error(message);
  }

  const smChangelog = await getPackageChangelog(appRoot);

  const maybeErrors = validate(manifestInfo.content);
  const parsedRepo = parseDomain(fromUrl(manifestInfo.content.apiEndpoint));
  const repo = extractRepo(parsedRepo);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const mockConfig = getMockConfig(cwd);

  const client = initClient(cwd, base, repo, prismicData.value.auth);

  return {
    errors: maybeErrors,
    env: {
      cwd,
      repo,
      manifest: manifestInfo.content,
      prismicData: prismicData.value,
      changelog: smChangelog,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      mockConfig,
      framework: NodeUtils.Framework.defineFramework({
        cwd,
        manifest: manifestInfo.content,
      }),
      isUserLoggedIn: !!prismicData.value.auth && !!repo,
      baseUrl: `http://localhost:${process.env.PORT || "9999"}`,
      client,
    },
  };
}
