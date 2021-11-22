import path from "path";
import { exec } from "child_process";
import {
  parseDomain,
  fromUrl,
  ParseResultType,
  ParseResult,
} from "parse-domain";

import getPrismicData from "./getPrismicData";

import { getConfig as getMockConfig } from "@lib/mock/misc/fs";
import Files from "@lib/utils/files";
import { SupportedFrameworks } from "@lib/consts";
import { createComparator } from "@lib/env/semver";
import { defineFramework, isValidFramework } from "@lib/env/framework";
import handleManifest, { ManifestStates, Manifest } from "@lib/env/manifest";

import initClient from "@lib/models/common/http";
import Environment from "@lib/models/common/Environment";
import ServerError from "@lib/models/server/ServerError";
import Chromatic from "@lib/models/common/Chromatic";
import { ConfigErrors } from "@lib/models/server/ServerState";
import UserConfig from "@lib/models/common/UserConfig";
import { SMConfig } from "@lib/models/paths";

declare let appRoot: string;

const compareNpmVersions = createComparator(path.join(appRoot, "package.json"));

function validate(config: Manifest): ConfigErrors {
  const errors: ConfigErrors = {};
  if (!config.storybook) {
    errors.storybook = {
      message: `Could not find storybook property in sm.json`,
      example: "http://localhost:STORYBOOK_PORT",
      run: 'Add "storybook" property with a localhost url',
    };
  }

  if (config.framework && !isValidFramework(config.framework)) {
    const options = Object.values(SupportedFrameworks);

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

function handleBranch(): Promise<{ branch?: string; err?: Error }> {
  return new Promise((resolve) => {
    exec("git rev-parse --abbrev-ref HEAD", (err: any, stdout: string) => {
      if (err) {
        resolve({ err });
      }
      resolve({ branch: stdout.trim() });
    });
  });
}

function createChromaticUrls({
  branch,
  appId,
  err,
}: {
  branch?: string;
  appId?: string;
  err?: Error;
}): Chromatic | undefined {
  if (err || !branch || !appId) {
    return;
  }
  return {
    storybook: `https://${branch}--${appId}.chromatic.com`,
    library: `https://chromatic.com/library?appId=${appId}&branch=${branch}`,
  };
}

function parseStorybookConfiguration(cwd: string) {
  const pathsToFile = [
    path.join(cwd, ".storybook/main.js"),
    path.join(cwd, ".storybook/main.cjs"),
    path.join(cwd, "nuxt.config.js"),
  ];
  const f = Files.readFirstOf(pathsToFile)((v) => v);
  const file = (f?.value as string) || "";
  return file.includes("getStoriesPaths") || file.includes(".slicemachine");
}

export default async function getEnv(
  maybeCustomCwd?: string
): Promise<{ errors?: { [errorKey: string]: ServerError }; env: Environment }> {
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

  const manifestState = handleManifest(cwd);
  if (manifestState.state !== ManifestStates.Valid) {
    console.error(manifestState.message);
    throw new Error(manifestState.message);
  }

  const userConfig = manifestState.content as UserConfig;

  const maybeErrors = validate(userConfig);
  const hasGeneratedStoriesPath = parseStorybookConfiguration(cwd);
  const parsedRepo = parseDomain(fromUrl(userConfig.apiEndpoint));
  const repo = extractRepo(parsedRepo);

  const branchInfo = await handleBranch();
  const chromatic = createChromaticUrls({
    ...branchInfo,
    appId: userConfig.chromaticAppId,
  });

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
      userConfig,
      hasConfigFile: true,
      prismicData: prismicData.value,
      chromatic,
      updateVersionInfo: {
        currentVersion: npmCompare.currentVersion,
        latestVersion: npmCompare.onlinePackage?.version || "",
        packageManager: npmCompare.packageManager,
        updateCommand: npmCompare.updateCommand,
        updateAvailable: npmCompare.updateAvailable,
      },
      currentVersion: "",
      updateAvailable: {
        current: "",
        next: "",
        message: "Could not fetch remote version",
      },
      mockConfig,
      hasGeneratedStoriesPath,
      framework: defineFramework(manifestState.content as Manifest, cwd),
      baseUrl: `http://localhost:${process.env.PORT}`,
      client,
    },
  };
}
