import { startServerAndOpenBrowser } from "../auth/helpers";
import { Poll } from "../utils";
import type { UserInfo } from "../models";
import { Communication, Endpoints } from "../prismic";
import { PrismicSharedConfigManager } from "../node-utils/PrismicSharedConfig";

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
    await Poll.startPolling<UserInfo | null, UserInfo>(
      () => Auth.validateSession(base),
      (user): user is UserInfo => !!user,
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
  signup: async (base: string): Promise<void> => {
    const endpoints = Endpoints.buildEndpoints(base);
    return startAuth({
      base,
      url: endpoints.Dashboard.cliSignup,
      action: "signup",
    });
  },
  logout: (): void => PrismicSharedConfigManager.remove(),
  validateSession: async (requiredBase: string): Promise<UserInfo | null> => {
    const config = PrismicSharedConfigManager.get();

    if (!config.cookies.length) return Promise.resolve(null); // default config, logged out.
    if (requiredBase != config.base) return Promise.resolve(null); // not the same base so it doesn't count.

    return Communication.validateSession(config.cookies, requiredBase).catch(
      () => null
    );
  },
};
