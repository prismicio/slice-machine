import { Utils } from "@slicemachine/core";
import { startServerAndOpenBrowser } from "./helpers";
import {
  Endpoints,
  PrismicSharedConfigManager,
} from "@slicemachine/core/build/prismic";
import { InitClient } from "../client";

async function startAuth({
  client,
  url,
  action,
}: {
  client: InitClient;
  url: string;
  action: "signup" | "login";
}): Promise<void> {
  const { onLoginFail } = await startServerAndOpenBrowser(
    url,
    action,
    client.apisEndpoints.Wroom
  );
  try {
    // We wait 3 minutes before timeout
    await Utils.Poll.startPolling<boolean, boolean>(
      () => Auth.validateSession(client),
      (isSessionValid): isSessionValid is boolean => isSessionValid == true,
      3000,
      60
    );
    return;
  } catch (e) {
    onLoginFail();
  }
}

export const Auth = {
  login: async (client: InitClient): Promise<void> => {
    const endpoints = Endpoints.buildEndpoints(client.apisEndpoints.Wroom);
    return startAuth({
      client,
      url: endpoints.Dashboard.cliLogin,
      action: "login",
    });
  },
  validateSession: async (client: InitClient): Promise<boolean> => {
    const authToken = PrismicSharedConfigManager.getAuth();

    // verify token is by retrieving the profile, update the config if need be.
    return client
      .updateAuthenticationToken(authToken)
      .profile()
      .then((userProfile) => {
        const config = PrismicSharedConfigManager.get();

        if (!config.shortId || !config.intercomHash) {
          PrismicSharedConfigManager.setProperties({
            shortId: userProfile.shortId,
            intercomHash: userProfile.intercomHash,
          });
        }
        return true;
      })
      .catch(() => false);
  },
};
