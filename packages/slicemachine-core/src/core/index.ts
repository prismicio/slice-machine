import { Manifest, removeAuthConfig } from "../filesystem";
import * as Auth from './auth'
import { buildEndpoints } from "../utils";
import * as communication from "./communication";
import { CONSTS } from "../utils";

export const Communication = communication

export interface Core {
  cwd: string,
  base: string,
  manifest: Manifest,

  Auth: {
    login: (port?: number) => Promise<void>,
    signup: (port?: number) => Promise<void>,
    logout: () => void,
  },

  CustomTypes?: {
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
  },

  Repository: {
    list: (token: string, base?: string) => Promise<string[]>
    create: (apiEndpoint: string, token: string) => Promise<void>
    validateName: (name: string, base?: string, existingRepo?: boolean) => Promise<string>
  }
}

export interface CoreParams {
  cwd: string,
  base: string,
  manifest: Manifest
}

export function createCore({
  cwd,
  base,
  manifest
}: CoreParams): Core {
  const endpoints = buildEndpoints(base)

  return {
    cwd,
    base,
    manifest,

    Auth: {
      login: (port?: number) => Auth.startServerAndOpenBrowser(endpoints.Dashboard.cliLogin, 'login', base, port),
      signup: (port?: number) => Auth.startServerAndOpenBrowser(endpoints.Dashboard.cliSignup, 'signup', base, port),
      logout: () => removeAuthConfig()
    },
    Repository: {
      create: (apiEndpoint: string, token: string) => Promise.resolve(),
      list: (token: string, base?: string): Promise<string[]> => communication.listRepositories(token, base),
      validateName: (name: string, base = CONSTS.DEFAULT_BASE, existingRepo = false) =>
        communication.validateRepositoryName(name, base, existingRepo),
    },
  }
}
