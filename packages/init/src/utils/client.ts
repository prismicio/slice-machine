import * as t from "io-ts";
import { Models } from "@slicemachine/core";
import { PrismicSharedConfigManager } from "@slicemachine/core/build/prismic";
import {
  Client as ClientModel,
  ApplicationMode,
  getAndValidateResponse,
} from "@slicemachine/client";

export const Client = (() => {
  let client: ClientModel;

  return {
    initialize(mode: ApplicationMode, authenticationToken: string) {
      if (!!client) return;
      client = new ClientModel(mode, null, authenticationToken);
    },

    async listRepositories(): Promise<Models.Repository[]> {
      return getAndValidateResponse<Models.Repository[]>(
        client._get(`${client.apisEndpoints.Users}repositories`),
        "repository list",
        t.array(Models.Repository)
      );
    },

    async createRepository(
      domain: string,
      framework: Models.Frameworks
    ): Promise<string> {
      const data = {
        domain,
        framework,
        plan: "personal",
        isAnnual: "false",
        role: "developer",
      };

      return client
        ._fetch(
          "post",
          `${client.apisEndpoints.Wroom}authentication/newrepository?app=slicemachine`,
          data,
          {
            Cookie: PrismicSharedConfigManager.get().cookies,
            "User-Agent": "prismic-cli/sm", // special user agent just for this route.
          }
        )
        .then(() => domain);
    },

    async domainExist(domain: string): Promise<boolean> {
      return getAndValidateResponse<boolean>(
        client._get(
          `${client.apisEndpoints.Wroom}app/dashboard/repositories/${domain}/exists`
        ),
        "repository exists",
        t.boolean
      );
    },

    get() {
      return client;
    },
  };
})();
