import { Manifest, removeAuthConfig } from "../filesystem";
import * as Communication from "./communication";
import { startServerAndOpenBrowser } from "./auth";
import { buildEndpoints } from "../utils";

export interface Core {
  cwd: string;
  base: string;
  manifest: Manifest;

  Repository: {
    list: (token: string) => Promise<string[]>;
    create?: (apiEndpoint: string, token: string) => Promise<void>;
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
      list: async (token: string): Promise<string[]> =>
        Communication.listRepositories(token, base),
    },
  };
}

export const Auth = {
  login: async (base: string): Promise<void> => {
    const endpoints = buildEndpoints(base);
    return startServerAndOpenBrowser(
      endpoints.Dashboard.cliLogin,
      "login",
      base
    );
  },
  signup: async (base: string): Promise<void> => {
    const endpoints = buildEndpoints(base);
    return startServerAndOpenBrowser(
      endpoints.Dashboard.cliSignup,
      "signup",
      base
    );
  },
  logout: (): void => removeAuthConfig(),
};
