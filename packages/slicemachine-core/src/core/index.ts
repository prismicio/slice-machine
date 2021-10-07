import { Manifest, removeAuthConfig } from "../filesystem";
import * as Auth from './auth'
import { buildEndpoints } from "../utils";

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

  Repository?: {
    list: (token: string) => Promise<string[]>
    create: (apiEndpoint: string, token: string) => Promise<void>
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
      login: (port?: number) => Auth.startServerAndOpenBrowser(endpoints.Dashboard.cliLogin, base, port),
      signup: (port?: number) => Auth.startServerAndOpenBrowser(endpoints.Dashboard.cliSignup, base, port),
      logout: () => removeAuthConfig()
    }
  }
}