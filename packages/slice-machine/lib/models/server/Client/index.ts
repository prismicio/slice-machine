import { getOrElseW } from "fp-ts/Either";
import { UserProfile } from "@slicemachine/core/build/models";

import { ApplicationMode } from "../ApplicationMode";
import {
  ApisEndpoints,
  ProductionApisEndpoints,
  StageApisEndpoints,
} from "./ApisEndpoints";
import { upload, UploadParams } from "./upload";
import { AclCreateResult } from "./Acl";

enum FetchMethods {
  GET = "get",
  POST = "post",
}

type Body = Record<string, unknown> | string;

export class Client {
  apisEndpoints: ApisEndpoints;
  repository: string;
  authenticationToken: string;

  constructor(
    applicationMode: ApplicationMode,
    repository: string,
    authenticationToken: string
  ) {
    this.repository = repository;
    this.authenticationToken = authenticationToken;

    if (applicationMode === ApplicationMode.PROD)
      this.apisEndpoints = ProductionApisEndpoints;
    else if (applicationMode === ApplicationMode.STAGE)
      this.apisEndpoints = StageApisEndpoints;
    else {
      // Dev
      this.apisEndpoints = ProductionApisEndpoints;
    }
  }

  // private fetch method
  _fetch(
    url: string,
    body?: Body,
    method: FetchMethods = FetchMethods.GET
  ): Promise<Response> {
    const headers = {
      repository: this.repository,
      Authorization: `Bearer ${this.authenticationToken}`,
      "User-Agent": "slice-machine",
    };

    return fetch(url, {
      headers,
      method,
      ...(method === FetchMethods.POST
        ? {
            body: "object" === typeof body ? JSON.stringify(body) : body,
          }
        : null),
    });
  }

  async validateAuthenticationToken(): Promise<Response> {
    return this._fetch(
      `${this.apisEndpoints.Authentication}validate?token=${this.authenticationToken}`
    );
  }

  async refreshAuthenticationToken(): Promise<string> {
    const response = await this._fetch(
      `${this.apisEndpoints.Authentication}refreshtoken?token=${this.authenticationToken}`
    );

    if (response.status && Math.floor(response.status / 100) === 2) {
      const newAuthenticationToken: string = await response.text();

      this.authenticationToken = newAuthenticationToken;
      return newAuthenticationToken;
    } else
      return Promise.reject(new Error("Client Error: Unable to refresh token"));
  }

  async profile(): Promise<UserProfile> {
    const response = await this._fetch(`${this.apisEndpoints.Users}profile`);
    if (response.status > 209)
      return Promise.reject(
        `Unable to retrieve profile with status code ${response.status}`
      );

    const json: Record<string, unknown> = response.json
      ? ((await response.json()) as Record<string, unknown>)
      : {};

    return getOrElseW(() =>
      Promise.reject(`Unable to parse profile: ${JSON.stringify(json)}`)
    )(UserProfile.decode(json));
  }

  async getSlice(): Promise<Response> {
    return this._fetch(`${this.apisEndpoints.Models}slices`);
  }

  async getCustomTypes(): Promise<Response> {
    return this._fetch(`${this.apisEndpoints.Models}customtypes`);
  }

  async insertCustomType(body: Body): Promise<Response> {
    return this._fetch(
      `${this.apisEndpoints.Models}customtypes/insert`,
      body,
      FetchMethods.POST
    );
  }

  async updateCustomType(body: Body): Promise<Response> {
    return this._fetch(
      `${this.apisEndpoints.Models}customtypes/update`,
      body,
      FetchMethods.POST
    );
  }

  async insertSlice(body: Body): Promise<Response> {
    return this._fetch(
      `${this.apisEndpoints.Models}slices/insert`,
      body,
      FetchMethods.POST
    );
  }

  async updateSlice(body: Body): Promise<Response> {
    return this._fetch(
      `${this.apisEndpoints.Models}slices/update`,
      body,
      FetchMethods.POST
    );
  }

  async createImagesAcl(): Promise<AclCreateResult> {
    return this._fetch(`${this.apisEndpoints.AclProvider}/create`).then(
      (response) => response.json() as Promise<AclCreateResult>
    );
  }

  async deleteImagesFolderAcl(body: Body): Promise<Response> {
    return this._fetch(
      `${this.apisEndpoints.AclProvider}delete-folder`,
      body,
      FetchMethods.POST
    );
  }

  async uploadImageAcl(params: UploadParams): Promise<number | undefined> {
    return upload(params);
  }
}
