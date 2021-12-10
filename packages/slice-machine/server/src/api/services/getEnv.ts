import path from "path";
import {
  parseDomain,
  fromUrl,
  ParseResultType,
  ParseResult,
} from "parse-domain";

import getPrismicData from "./getPrismicData";

import { getConfig as getMockConfig } from "@lib/mock/misc/fs";
import Files from "@lib/utils/files";
import { createComparator } from "@lib/env/semver";
import handleManifest, { ManifestState, ManifestInfo } from "@lib/env/manifest";

import initClient from "@lib/models/common/http";
import { BackendEnvironment } from "@lib/models/common/Environment";
import { ConfigErrors } from "@lib/models/server/ServerState";
import { SMConfig } from "@lib/models/paths";
import { Models, Utils } from "@slicemachine/core";

declare let appRoot: string;

const compareNpmVersions = createComparator(path.join(appRoot, "package.json"));

function validate(config: Models.Manifest): ConfigErrors {
  const errors: ConfigErrors = {};
  if (!config.storybook) {
    errors.storybook = {
      message: `Could not find storybook property in sm.json`,
      example: "http://localhost:STORYBOOK_PORT",
      run: 'Add "storybook" property with a localhost url',
    };
  }

  if (
    config.framework &&
    !Utils.Framework.isValidFramework(Models.Frameworks[config.framework])
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

  if (!Files.exists(SMConfig(cwd))) {
    const message =
      "[api/env]: Unrecoverable error. Could not find sm.json in your project. Exiting..";
    console.error(message);
    throw new Error(message);
  }

  const prismicData = getPrismicData();

  if (!prismicData.isOk()) {
    const message =
      "[api/env]: Unrecoverable error. ~/.prismic file unreadable";
    console.error(message);
    throw new Error(message);
  }

  const npmCompare = await compareNpmVersions({ cwd });

  const manifestInfo: ManifestInfo = handleManifest(cwd);
  if (manifestInfo.state !== ManifestState.Valid || !manifestInfo.content) {
    console.error(manifestInfo.message);
    throw new Error(manifestInfo.message);
  }

  const maybeErrors = validate(manifestInfo.content);
  const parsedRepo = parseDomain(fromUrl(manifestInfo.content.apiEndpoint));
  const repo = extractRepo(parsedRepo);
  const mockConfig = getMockConfig(cwd);

  const client = initClient(
    cwd,
    prismicData.value.base,
    repo,
    prismicData.value.auth
  );

  return {
    errors: maybeErrors,
    env: {
      cwd,
      repo,
      manifest: manifestInfo.content,
      prismicData: prismicData.value,
      updateVersionInfo: {
        currentVersion: npmCompare.currentVersion,
        latestVersion: npmCompare.onlinePackage?.version || "",
        packageManager: npmCompare.packageManager,
        updateCommand: npmCompare.updateCommand,
        updateAvailable: npmCompare.updateAvailable,
      },
      mockConfig,
      framework: Utils.Framework.defineFramework(
        manifestInfo.content,
        cwd,
        Models.SupportedFrameworks
      ),
      baseUrl: `http://localhost:${process.env.PORT || "9999"}`,
      client,
    },
  };
}
