import {
  Manifest,
  removeAuthConfig,
  getOrCreateAuthConfig,
  AuthConfig,
} from "../filesystem";
import { startServerAndOpenBrowser } from "./auth";
import { Poll, Endpoints, Framework } from "../utils";

import * as Communication from "./communication";
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
    list: (token: string) => Promise<Communication.RepoData>;
    create: (
      apiEndpoint: string,
      token: string,
      framework: Framework.FrameworkEnum
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
      list: async (token: string): Promise<Communication.RepoData> =>
        Communication.listRepositories(token, base),
      validateName: (name: string, existingRepo = false): Promise<string> =>
        Communication.validateRepositoryName(name, base, existingRepo),
      create: async (
        domain: string,
        token: string,
        framework: Framework.FrameworkEnum
      ): Communication.CreateRepositoryResponse =>
        Communication.createRepository(domain, token, framework, base),
    },
  };
}

export const Auth = {
  login: async (base: string): Promise<void> => {
    const endpoints = Endpoints.buildEndpoints(base);
    const { onLoginFail } = await startServerAndOpenBrowser(
      endpoints.Dashboard.cliLogin,
      "login",
      base
    );
    try {
      // We wait 3 minutes before timeout
      return await Poll.startPolling<Communication.UserInfo | null>(
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
    const endpoints = Endpoints.buildEndpoints(base);
    const { onLoginFail } = await startServerAndOpenBrowser(
      endpoints.Dashboard.cliSignup,
      "signup",
      base
    );
    try {
      // We wait 3 minutes before timeout
      return await Poll.startPolling<Communication.UserInfo | null>(
        () => Auth.validateSession(base),
        (user) => !!user,
        3000,
        60
      );
    } catch (e) {
      onLoginFail();
    }
  },
  logout: (): void => removeAuthConfig(),
  validateSession: async (
    requiredBase: string
  ): Promise<Communication.UserInfo | null> => {
    const config: AuthConfig = getOrCreateAuthConfig();

    if (!config.cookies.length) return Promise.resolve(null); // default config, logged out.
    if (requiredBase != config.base) return Promise.resolve(null); // not the same base so it doesn't count.

    return Communication.validateSession(config.cookies, requiredBase).catch(
      () => null
    );
  },
};
