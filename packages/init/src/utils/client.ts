import * as t from "io-ts";
import { Models } from "@slicemachine/core";
import { PrismicSharedConfigManager } from "@slicemachine/core/build/prismic";
import { Client, getAndValidateResponse } from "@slicemachine/client";

export class InitClient extends Client {
  async listRepositories(): Promise<Models.Repository[]> {
    return getAndValidateResponse<Models.Repository[]>(
      this._get(`${this.apisEndpoints.Users}repositories`),
      "repository list",
      t.array(Models.Repository)
    );
  }

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

    return this._fetch(
      "post",
      `${this.apisEndpoints.Wroom}authentication/newrepository?app=slicemachine`,
      data,
      {
        Cookie: PrismicSharedConfigManager.get().cookies,
        "User-Agent": "prismic-cli/sm", // special user agent just for this route.
      }
    ).then(() => domain);
  }

  async domainExist(domain: string): Promise<boolean> {
    return getAndValidateResponse<boolean>(
      this._get(
        `${this.apisEndpoints.Wroom}app/dashboard/repositories/${domain}/exists`
      ),
      "repository exists",
      t.boolean
    );
  }
}
