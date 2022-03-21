import type { Manifest, Frameworks } from "../models";
import * as Communication from "./communication";
import { Repositories } from "../models/Repositories";

export * as Communication from "./communication";
export * as Endpoints from "./endpoints";
export * from "./SharedConfig";

export interface Core {
  cwd: string;
  base: string;
  manifest: Manifest;

  /*CustomTypes?: {
    get: (apiEndpoint: string, token: string, customTypeId: string) => Promise<any>,
1    getAll: (apiEndpoint: string, token: string) => Promise<any>,
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
