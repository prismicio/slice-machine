import { startServerAndOpenBrowser } from "./auth";
import { Poll, Endpoints } from "../utils";
import type { Manifest, Frameworks } from "../models";
import * as Communication from "./communication";
import { PrismicSharedConfigManager } from "../filesystem/PrismicSharedConfig";
import { Repositories } from "../models/Repositories";
export * as Communication from "./communication";

export interface Core {
  cwd: string;
  base: string;
  manifest: Manifest;

  /*CustomTypes?: {
    get: (apiEndpoint: string, token: string, customTypeId: string) => Promise<any>,
    getAll: (apiEndpoint: string, token: string) => Promise<any>,
    insert: (apiEndpoint: string, token: string, data: any) => Promise<void>,
    update: (apiEndpoint: string, token: string, data: any) => Promise<void>,
    remove: (apiEndpoint: string, token: string, customTypeId: string) => Promise<void>
  },
  Slices?: {
    get: (apiEndpoint: string, token: string, sliceId: string) => Promise<any>,
    getAll: (apiEndpoint: string, token: string) => Promise<any>,
    insert: (apiEndpoint: string, token: string, data: any) => Promise<void>,
    update: (apiEndpoint: string, token: string, data: any) => Promise<void>,
    remove: (apiEndpoint: string, token: string, sliceId: string) => Promise<void>
  },*/

  Repository: {
    list: (token: string) => Promise<Repositories>;
    create: (
      apiEndpoint: string,
      token: string,
      framework: Frameworks
    ) => Communication.CreateRepositoryResponse;
    validateName: (name: string, existingRepo?: boolean) => Promise<string>;
  };
}

export interface CoreParams {
  cwd: string;
  base: string;
  manifest: Manifest;
}

export default function createCore({ cwd, base, manifest }: CoreParams): Core {
  return {
    cwd,
    base,
    manifest,

    Repository: {
      list: async (token: string): Promise<Repositories> =>
        Communication.listRepositories(token),
      validateName: (name: string, existingRepo = false): Promise<string> =>
        Communication.validateRepositoryName(name, base, existingRepo),
      create: async (
        domain: string,
        token: string,
        framework: Frameworks
      ): Communication.CreateRepositoryResponse =>
        Communication.createRepository(domain, token, framework, base),
    },
  };
}

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
    await Poll.startPolling<
      Communication.UserInfo | null,
      Communication.UserInfo
    >(
      () => Auth.validateSession(base),
      (user): user is Communication.UserInfo => !!user,
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
  validateSession: async (
    requiredBase: string
  ): Promise<Communication.UserInfo | null> => {
    const config = PrismicSharedConfigManager.get();

    if (!config.cookies.length) return Promise.resolve(null); // default config, logged out.
    if (requiredBase != config.base) return Promise.resolve(null); // not the same base so it doesn't count.

    return Communication.validateSession(config.cookies, requiredBase).catch(
      () => null
    );
  },
};
