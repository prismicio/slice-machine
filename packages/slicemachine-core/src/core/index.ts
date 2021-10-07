import * as communication from "./communication";

interface Core {
  CustomTypes: {
    get: (
      apiEndpoint: string,
      token: string,
      customTypeId: string
    ) => Promise<any>;
    getAll: (apiEndpoint: string, token: string) => Promise<any>;
    insert: (apiEndpoint: string, token: string, data: any) => Promise<void>;
    update: (apiEndpoint: string, token: string, data: any) => Promise<void>;
    remove: (
      apiEndpoint: string,
      token: string,
      customTypeId: string
    ) => Promise<void>;
  };

  Slices: {
    get: (apiEndpoint: string, token: string, sliceId: string) => Promise<any>;
    getAll: (apiEndpoint: string, token: string) => Promise<any>;
    insert: (apiEndpoint: string, token: string, data: any) => Promise<void>;
    update: (apiEndpoint: string, token: string, data: any) => Promise<void>;
    remove: (
      apiEndpoint: string,
      token: string,
      sliceId: string
    ) => Promise<void>;
  };

  Repository: {
    list: (token: string, base?: string) => Promise<string[]>;
    create: (apiEndpoint: string, token: string) => Promise<void>;
    validateName: (name: string, existingRepo?: boolean) => Promise<string>;
  };
}

type Roles = "Writer" | "Owner" | "Publisher" | "Admin"; // other roles ?
type RepoData = Record<string, { role: Roles; dbid: string }>;

export const Core: Core = {
  CustomTypes: {},
  Slices: {},
  Repository: {
    list: (token: string, base?: string): Promise<Array<string>> => {
      return communication
        .validateSession(token, base)
        .then(
          (res) =>
            res.json() as Promise<{
              email: string;
              type: string;
              repositories: RepoData;
            }>
        )
        .then((data) => Object.keys(data.repositories));
    },

    validateName: (name: string, existingRepo = false) =>
      communication.validateRepositoryName(name, existingRepo),
  },
};
