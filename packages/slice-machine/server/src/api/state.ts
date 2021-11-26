import fetchLibs from "./libraries";
import fetchCustomTypes from "./custom-types/index";
import getEnv from "./services/getEnv";
import { warningStates, warningTwoLiners } from "@lib/consts";
import { fetchStorybookUrl } from "./common/storybook";
import Environment from "@lib/models/common/Environment";
import Warning from "@lib/models/common/Warning";
import ErrorWithStatus from "@lib/models/common/ErrorWithStatus";
import ServerError from "@lib/models/server/ServerError";
import Files from "@lib/utils/files";
import { Pkg } from "@lib/models/paths";
import { generate } from "./common/generate";
import DefaultClient from "@lib/models/common/http/DefaultClient";
import { FileSystem } from "@slicemachine/core";

const hasStorybookScript = (cwd: string) => {
  const pathToManifest = Pkg(cwd);
  try {
    const manifest = Files.readJson(pathToManifest);
    return !!(manifest && manifest.scripts && manifest.scripts.storybook);
  } catch (e) {
    return false;
  }
};

export async function createWarnings(
  env: Environment,
  configErrors?: { [errorKey: string]: ServerError },
  clientError?: ErrorWithStatus
): Promise<ReadonlyArray<Warning>> {
  const hasScript = hasStorybookScript(env.cwd);
  const storybookIsRunning = await (async () => {
    try {
      await fetchStorybookUrl(env.userConfig.storybook);
      return true;
    } catch (e) {
      return false;
    }
  })();

  const storybook = (() => {
    if (configErrors?.storybook) {
      const notInManifest = (warningTwoLiners as any)[
        warningStates.STORYBOOK_NOT_IN_MANIFEST
      ];
      return {
        key: warningStates.STORYBOOK_NOT_IN_MANIFEST,
        title: notInManifest[0],
        description: notInManifest[1],
      };
    }
    if (!hasScript) {
      const notInstalled = (warningTwoLiners as any)[
        warningStates.STORYBOOK_NOT_INSTALLED
      ];
      return {
        key: warningStates.STORYBOOK_NOT_INSTALLED,
        title: notInstalled[0],
        description: notInstalled[1],
      };
    }

    if (!storybookIsRunning) {
      const notRunning = (warningTwoLiners as any)[
        warningStates.STORYBOOK_NOT_RUNNING
      ];
      return {
        key: warningStates.STORYBOOK_NOT_RUNNING,
        title: notRunning[0],
        description: notRunning[1],
      };
    }
  })();

  const newVersion =
    env.updateVersionInfo && env.updateVersionInfo.updateAvailable
      ? {
          key: warningStates.NEW_VERSION_AVAILABLE,
          value: env.updateVersionInfo,
        }
      : undefined;

  const connected = !env.prismicData?.auth
    ? {
        key: warningStates.NOT_CONNECTED,
      }
    : undefined;

  const client = clientError
    ? {
        key: warningStates.CLIENT_ERROR,
        title: `${
          warningStates.CLIENT_ERROR
        }:${clientError.reason.toUpperCase()}`,
      }
    : undefined;

  return [storybook, newVersion, connected, client].filter(
    Boolean
  ) as ReadonlyArray<Warning>;
}

export default async function handler() {
  const { env, errors: configErrors } = await getEnv();
  const { libraries, remoteSlices, clientError } = await fetchLibs(env);
  const { customTypes, remoteCustomTypes, isFake } = await fetchCustomTypes(
    env
  );

  // Refresh auth
  if (!isFake && env.prismicData.auth) {
    try {
      const newTokenResponse: Response = await DefaultClient.refreshToken(
        env.prismicData.base,
        env.prismicData.auth
      );

      if (
        newTokenResponse.status &&
        Math.floor(newTokenResponse.status / 100) === 2
      ) {
        const newtToken = await newTokenResponse.text();
        FileSystem.updateAuthCookie(newtToken);
      }
    } catch (e) {
      console.error("[Refresh token]: Internal error : ", e);
    }
  }

  const warnings = await createWarnings(env, configErrors, clientError);

  await generate(env, libraries);
  env.tracker.Repository(env.repo)?.libraries(libraries);

  return {
    libraries,
    customTypes,
    remoteCustomTypes,
    remoteSlices,
    clientError,
    isFake,
    configErrors,
    env,
    warnings,
  };
}
