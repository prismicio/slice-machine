import path from "path";
import upload from "./upload";

import Files from "../../../utils/files";

interface ApiSettings {
  DEV: string;
  STAGE: string;
  PROD: string;
}

type DevConfig = [string, string, string];

const SharedSlicesApi = {
  DEV: "https://customtypes.wroom.test/",
  STAGE: "https://customtypes.wroom.io/",
  PROD: "https://customtypes.prismic.io/",
} as ApiSettings;

const AuthApi = {
  DEV: "https://auth.wroom.test/",
  STAGE: "https://auth.wroom.io/",
  PROD: "https://auth.prismic.io/",
} as ApiSettings;

const AclProviderApi = {
  DEV: "https://customtypes.prismic.io/",
  STAGE: "https://2iamcvnxf4.execute-api.us-east-1.amazonaws.com/stage/",
  PROD: "https://0yyeb2g040.execute-api.us-east-1.amazonaws.com/prod/",
} as ApiSettings;

const SlicesPrefix = "slices/";
const ValidatePrefix = "validate/";
const CustomTypesPrefix = "customtypes/";

function createApiUrl(base: string, { STAGE, PROD, DEV }: ApiSettings): string {
  if (base && base.includes("wroom.io")) {
    return STAGE;
  }
  if (base && base.includes("wroom.test")) {
    return DEV;
  }
  return PROD;
}

function createFetcher(
  apiUrl: string,
  repo: string,
  auth: string
): (
  prefix: string,
  body?: object | string,
  action?: string,
  method?: string
) => Promise<Response> {
  return function runFetch(
    prefix: string,
    body?: object | string,
    action = "",
    method = "get"
  ): Promise<Response> {
    const headers = {
      repository: repo,
      Authorization: `Bearer ${auth}`,
    };
    return fetch(new URL(action, `${apiUrl}${prefix}`).toString(), {
      headers,
      method,
      ...(method === "post"
        ? {
            body: "object" === typeof body ? JSON.stringify(body) : body,
          }
        : null),
    });
  };
}

const initFetcher = (
  base: string,
  ApiUrls: ApiSettings,
  devConfigArgs: DevConfig,
  repo: string,
  auth: string
) => {
  const apiUrl = createApiUrl(base, ApiUrls);
  const args = devConfigArgs ? devConfigArgs : [apiUrl, repo, auth];
  return createFetcher(args[0], args[1], args[2]);
};

export default class DefaultClient {
  apiFetcher: (
    prefix: string,
    body?: object | string,
    action?: string,
    method?: string
  ) => Promise<Response>;
  aclFetcher: (
    prefix: string,
    body?: object | string,
    action?: string,
    method?: string
  ) => Promise<Response>;

  static validate(base: string, auth: string) {
    return fetch(
      `${createApiUrl(base, AuthApi)}${ValidatePrefix}?token=${auth}`,
      {
        method: "GET",
      }
    ).catch((e) => e);
  }

  constructor(
    readonly cwd: string,
    readonly base: string,
    readonly repo: string,
    readonly auth: string
  ) {
    const devConfig = (() => {
      if (!cwd) {
        return {};
      }
      try {
        return Files.readJson(path.join(cwd, "sm.dev.json"));
      } catch (e) {
        return {};
      }
    })();

    this.base = base;
    this.auth = auth;
    this.apiFetcher = initFetcher(
      base,
      SharedSlicesApi,
      devConfig.sharedSlicesApi,
      repo,
      auth
    );
    this.aclFetcher = initFetcher(
      base,
      AclProviderApi,
      devConfig.aclProviderApi,
      repo,
      auth
    );
  }

  isFake() {
    return false;
  }

  async getSlice() {
    return this.apiFetcher(SlicesPrefix);
  }

  async getCustomTypes() {
    return this.apiFetcher(CustomTypesPrefix);
  }

  async insertCustomType(body: object | string) {
    return this.apiFetcher(CustomTypesPrefix, body, "insert", "post");
  }

  async updateCustomType(body: object | string) {
    return this.apiFetcher(CustomTypesPrefix, body, "update", "post");
  }

  async insertSlice(body: object | string) {
    return this.apiFetcher(SlicesPrefix, body, "insert", "post");
  }

  async updateSlice(body: object | string) {
    return this.apiFetcher(SlicesPrefix, body, "update", "post");
  }

  images = {
    createAcl: async () => {
      return this.aclFetcher("", undefined, "create", "get");
    },
    deleteFolder: async (body: object | string) => {
      return this.aclFetcher("", body, "delete-folder", "post");
    },
    post: async (params: {
      url: string;
      fields: { [key: string]: string };
      key: string;
      filename: string;
      pathToFile: string;
    }) => {
      return upload(params);
    },
  };
}
