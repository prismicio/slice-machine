import fetchLibs from "./libraries";
import fetchCustomTypes from "./custom-types/index";
import {
  BackendEnvironment,
  FrontEndEnvironment,
} from "@lib/models/common/Environment";
import ServerError from "@lib/models/server/ServerError";

import { generate } from "./common/generate";
import DefaultClient from "@lib/models/common/http/DefaultClient";
import { NodeUtils, Prismic } from "@slicemachine/core";
import { RequestWithEnv } from "./http/common";
import ServerState from "@models/server/ServerState";
import { setShortId } from "./services/setShortId";
import preferWroomBase from "../../../lib/utils/preferWroomBase";

export const getBackendState = async (
  configErrors: Record<string, ServerError>,
  env: BackendEnvironment
) => {
  const { libraries, remoteSlices, clientError } = await fetchLibs(env);
  const { customTypes, remoteCustomTypes } = await fetchCustomTypes(env);

  const base = preferWroomBase(env.manifest.apiEndpoint);

  // Refresh auth
  if (env.isUserLoggedIn && env.prismicData.auth) {
    try {
      const newTokenResponse: Response = await DefaultClient.refreshToken(
        base,
        env.prismicData.auth
      );

      if (
        newTokenResponse.status &&
        Math.floor(newTokenResponse.status / 100) === 2
      ) {
        const newToken = await newTokenResponse.text();
        Prismic.PrismicSharedConfigManager.setAuthCookie(newToken);

        // set the short ID if it doesn't exist yet.
        if (!env.prismicData.shortId) await setShortId(env, newToken);
      }
    } catch (e) {
      console.error("[Refresh token]: Internal error : ", e);
    }
  }

  generate(env, libraries);

  return {
    libraries,
    customTypes,
    remoteCustomTypes,
    remoteSlices,
    clientError,
    configErrors,
    env,
  };
};

export default async function handler(
  req: RequestWithEnv
): Promise<ServerState> {
  const { errors: configErrors, env } = req;
  const serverState = await getBackendState(configErrors, env);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-vars
  const { client, cwd, prismicData, baseUrl, ...frontEnv } = serverState.env;
  const frontEndEnv: FrontEndEnvironment = {
    ...frontEnv,
    sliceMachineAPIUrl: baseUrl,
    packageManager: NodeUtils.Files.exists(NodeUtils.YarnLockPath(cwd))
      ? "yarn"
      : "npm",
    shortId: prismicData.shortId,
  };

  return {
    customTypes: serverState.customTypes,
    remoteCustomTypes: serverState.remoteCustomTypes,
    libraries: serverState.libraries,
    remoteSlices: serverState.remoteSlices,
    env: frontEndEnv,
  };
}
