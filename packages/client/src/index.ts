import axios, { AxiosPromise } from "axios"
import * as t from 'io-ts'

import { UserProfile } from "@slicemachine/core/build/models"
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices"
import { CustomType } from "@prismicio/types-internal/lib/customtypes/CustomType"

import { ApplicationMode } from "models/ApplicationMode"
import { getAndValidateResponse } from "./utils"
import {
  ApisEndpoints,
  ProductionApisEndpoints,
  StageApisEndpoints,
} from "./models/ApisEndpoints"
import { upload, UploadParams } from "./utils/upload"
import { AclCreateResult } from "./models/Acl"

export class Client {
  apisEndpoints: ApisEndpoints
  repository: string | null
  authenticationToken: string

  constructor(
    applicationMode: ApplicationMode,
    repository: string | null,
    authenticationToken: string
  ) {
    this.repository = repository
    this.authenticationToken = authenticationToken

    if (applicationMode === ApplicationMode.PROD)
      this.apisEndpoints = ProductionApisEndpoints
    else if (applicationMode === ApplicationMode.STAGE)
      this.apisEndpoints = StageApisEndpoints
    else {

      // Dev
      this.apisEndpoints = ProductionApisEndpoints
    }
  }

  updateAuthenticationToken(newToken: string) {
    this.authenticationToken = newToken
  }

  updateRepository(repository: string | null) {
    this.repository = repository
  }

  // private methods
  _fetch(
    method: 'get' | 'post',
    url: string,
    data?: Record<string, unknown>
  ): AxiosPromise {
    const headers = {
      Authorization: `Bearer ${this.authenticationToken}`,
      "User-Agent": "slice-machine",
      ...this.repository ? { repository: this.repository } : {}
    }

    return axios({
      method,
      url,
      data,
      headers
    })
  }

  _get(url: string): AxiosPromise {
    return this._fetch('get', url)
  }

  _post(url: string, data: Record<string, unknown>): AxiosPromise {
    return this._fetch('post', url, data)
  }

  async validateAuthenticationToken(): Promise<boolean> {
    return this._get(
      `${this.apisEndpoints.Authentication}validate?token=${this.authenticationToken}`
    ).then(() => true)
    .catch(error => {
      if (axios.isAxiosError(error) && error.response?.status == 401) return false
      else throw error
    })
  }

  async refreshAuthenticationToken(): Promise<string> {
    return getAndValidateResponse<string>(
      this._get(`${this.apisEndpoints.Authentication}refreshtoken?token=${this.authenticationToken}`),
      "refreshed authentication token",
      t.string
    ).then(newToken => {
      this.updateAuthenticationToken(newToken)
      return newToken
    })
  }

  async profile(): Promise<UserProfile> {
    return getAndValidateResponse<UserProfile>(
      this._get(`${this.apisEndpoints.Users}profile`),
      "user profile",
      UserProfile
    )
  }

  async getSlice(): Promise<SharedSlice[]> {
    return getAndValidateResponse<SharedSlice[]>(
      this._get(`${this.apisEndpoints.Models}slices`),
      "shared slices",
      t.array(SharedSlice)
    )
  }

  async getCustomTypes(): Promise<CustomType[]> {
    return getAndValidateResponse<CustomType[]>(
      this._get(`${this.apisEndpoints.Models}customtypes`),
      "custom types",
      t.array(CustomType)
    )
  }

  async insertCustomType(customType: CustomType): Promise<AxiosPromise> {
    return this._post(`${this.apisEndpoints.Models}customtypes/insert`, customType)
  }

  async updateCustomType(customType: CustomType): Promise<AxiosPromise> {
    return this._post(`${this.apisEndpoints.Models}customtypes/update`, customType)
  }

  async insertSlice(sharedSlice: SharedSlice): Promise<AxiosPromise> {
    return this._post(`${this.apisEndpoints.Models}slices/insert`, sharedSlice)
  }

  async updateSlice(sharedSlice: SharedSlice): Promise<AxiosPromise> {
    return this._post(`${this.apisEndpoints.Models}slices/update`, sharedSlice)
  }

  async createImagesAcl(): Promise<AclCreateResult> {
    return getAndValidateResponse<AclCreateResult>(
      this._get(`${this.apisEndpoints.AclProvider}/create`),
      "acl",
      AclCreateResult
    )
  }

  async deleteImagesFolderAcl(sliceName: string): Promise<AxiosPromise> {
    return this._post(`${this.apisEndpoints.AclProvider}delete-folder`, { sliceName })
  }

  async uploadImageAcl(params: UploadParams): Promise<number | undefined> {
    return upload(params)
  }
}
