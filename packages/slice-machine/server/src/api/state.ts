import fetchLibs from "./libraries";
import fetchCustomTypes from "./custom-types/index";
import getEnv from "./services/getEnv";
import { warningStates } from "@lib/consts";

import Environment from "@lib/models/common/Environment";
import Warning from "@lib/models/common/Warning";
import ErrorWithStatus from "@lib/models/common/ErrorWithStatus";
import ServerError from "@lib/models/server/ServerError";

import { generate } from "./common/generate";
import DefaultClient from "@lib/models/common/http/DefaultClient";
import { FileSystem } from "@slicemachine/core";

export async function createWarnings(
  env: Environment,
  configErrors?: { [errorKey: string]: ServerError },
  clientError?: ErrorWithStatus
): Promise<ReadonlyArray<Warning>> {
  console.log("Update config errors");
  configErrors;

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

  return [newVersion, connected, client].filter(
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
