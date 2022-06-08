import { Utils } from "@slicemachine/core";
import { startServerAndOpenBrowser } from "./helpers";
import {
  Endpoints,
  PrismicSharedConfigManager,
} from "@slicemachine/core/build/prismic";
import { Client } from "../client";

async function startAuth({
  base,
  url,
  action,
}: {
  base: string;
  url: string;
  action: "signup" | "login";
}): Promise<void> {
  const { onLoginFail } = await startServerAndOpenBrowser(url, action, base);
  try {
    // We wait 3 minutes before timeout
    await Utils.Poll.startPolling<boolean, boolean>(
      () => Auth.validateSession(),
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
  login: async (base: string): Promise<void> => {
    const endpoints = Endpoints.buildEndpoints(base);
    return startAuth({
      base,
      url: endpoints.Dashboard.cliLogin,
      action: "login",
    });
  },
  validateSession: async (): Promise<boolean> => {
    const authToken = PrismicSharedConfigManager.getAuth();

    // update client's token
    Client.get().updateAuthenticationToken(authToken);

    // verify token is by retrieving the profile, update the config if need be.
    return Client.get()
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
