import * as t from "io-ts";
import { Models } from "@slicemachine/core";
import { PrismicSharedConfigManager } from "@slicemachine/core/build/prismic";
import { Client, getAndValidateResponse } from "@slicemachine/client";
import { parse } from "@slicemachine/core/build/utils/cookie";

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

    return this._fetch({
      method: "post",
      url: `${this.apisEndpoints.Wroom}authentication/newrepository?app=slicemachine`,
      data: data,
      headers: {
        Cookie: PrismicSharedConfigManager.get().cookies,
        "User-Agent": "prismic-cli/sm", // special user agent just for this route.
      },
    }).then(() => domain);
  }

  async deleteRepository(
    domain: string,
    password: string,
    cookies: string
  ): Promise<string> {
    const repositoryDirectUrl = new URL(this.apisEndpoints.Wroom);
    repositoryDirectUrl.hostname = `${domain}.${repositoryDirectUrl.hostname}`;

    const token = parse(cookies).X_XSRF;

    return this._fetch({
      method: "post",
      url: `${repositoryDirectUrl.toString()}app/settings/delete?_=${token}`,
      data: { confirm: domain, password },
      headers: {
        Cookie: cookies,
        "User-Agent": "prismic-cli/0", // special user agent just for this route.
      },
    }).then(() => domain);
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

  async pushDocuments(
    signature: string,
    documents: Record<string, unknown>,
    cookies: string
  ) {
    if (!this.repository) throw new Error("Repository undefined in the client");
    const repositoryDirectUrl = new URL(this.apisEndpoints.Wroom);
    repositoryDirectUrl.hostname = `${this.repository}.${repositoryDirectUrl.hostname}`;

    return this._fetch({
      method: "post",
      url: `${repositoryDirectUrl.toString()}starter/documents`,
      data: { signature, documents: JSON.stringify(documents) },
      headers: {
        Cookie: cookies,
        "User-Agent": "prismic-cli/0", // special user agent just for this route.
      },
    });
  }
}
