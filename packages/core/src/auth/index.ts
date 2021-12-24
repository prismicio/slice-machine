import { SharedConfigManager, buildEndpoints } from "../prismic";
import * as Communication from "../prismic/communication";

import { startPolling } from "./poll";
import { startServerAndOpenBrowser } from "./helpers";

export const Auth = {
  login: async (base: string): Promise<void> => {
    const endpoints = buildEndpoints(base);
    const { onLoginFail } = await startServerAndOpenBrowser(
      endpoints.Dashboard.cliLogin,
      "login",
      base
    );
    try {
      // We wait 3 minutes before timeout
      return await startPolling<Communication.UserInfo | null>(
        () => Auth.validateSession(base),
        (user) => !!user,
        3000,
        60
      );
    } catch (e) {
      onLoginFail();
    }
  },
  signup: async (base: string): Promise<void> => {
    const endpoints = buildEndpoints(base);
    const { onLoginFail } = await startServerAndOpenBrowser(
      endpoints.Dashboard.cliSignup,
      "signup",
      base
    );
    try {
      // We wait 3 minutes before timeout
      return await startPolling<Communication.UserInfo | null>(
        () => Auth.validateSession(base),
        (user) => !!user,
        3000,
        60
      );
    } catch (e) {
      onLoginFail();
    }
  },
  logout: (): void => SharedConfigManager.remove(),
  validateSession: async (
    requiredBase: string
  ): Promise<Communication.UserInfo | null> => {
    const config = SharedConfigManager.get();

    if (!config.cookies.length) return Promise.resolve(null); // default config, logged out.
    if (requiredBase != config.base) return Promise.resolve(null); // not the same base so it doesn't count.

    return Communication.validateSession(config.cookies, requiredBase).catch(
      () => null
    );
  },
};
