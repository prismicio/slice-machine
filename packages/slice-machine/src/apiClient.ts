import axios, { AxiosResponse } from "axios";
import { CheckAuthStatusResponse } from "@models/common/Auth";
import { SimulatorCheckResponse } from "@models/common/Simulator";
import {
  RenameCustomTypeBody,
  SaveCustomTypeBody,
} from "@models/common/CustomType";
import { CustomTypeMockConfig } from "@models/common/MockConfig";
import { SliceBody } from "@models/common/Slice";
import ServerState from "@models/server/ServerState";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import { ScreenshotResponse } from "../lib/models/common/Screenshots";
import { ComponentUI, ScreenshotUI } from "@lib/models/common/ComponentUI";

const defaultAxiosConfig = {
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
};

/** State Routes **/

export const getState = (): Promise<AxiosResponse<ServerState>> => {
  return axios.get<ServerState>("/api/state", defaultAxiosConfig);
};

/** Custom Type Routes **/

export const saveCustomType = (
  customType: CustomTypeSM,
  mockConfig: CustomTypeMockConfig
): Promise<AxiosResponse> => {
  const requestBody: SaveCustomTypeBody = {
    model: customType,
    mockConfig: mockConfig,
  };

  return axios.post("/api/custom-types/save", requestBody, defaultAxiosConfig);
};

export const renameCustomType = (
  customTypeId: string,
  newCustomTypeName: string
): Promise<AxiosResponse> => {
  const requestBody: RenameCustomTypeBody = {
    customTypeId,
    newCustomTypeName,
  };

  return axios.patch(
    `/api/custom-types/rename?id=${customTypeId}`,
    requestBody,
    defaultAxiosConfig
  );
};

export const pushCustomType = (
  customTypeId: string
): Promise<AxiosResponse> => {
  return axios.get(
    `/api/custom-types/push?id=${customTypeId}`,
    defaultAxiosConfig
  );
};

/** Slice Routes **/
export const createSlice = (
  sliceName: string,
  libName: string
): Promise<{ variationId: string }> => {
  const requestBody: SliceBody = {
    sliceName,
    from: libName,
  };

  return axios
    .post(`/api/slices/create`, requestBody, defaultAxiosConfig)
    .then((response: AxiosResponse<{ variationId: string }>) => response.data);
};

export const renameSlice = (
  sliceId: string,
  newSliceName: string,
  libName: string
): Promise<AxiosResponse> => {
  const requestBody = {
    sliceId,
    newSliceName,
    libName,
  };
  return axios.put(`/api/slices/rename`, requestBody, defaultAxiosConfig);
};

export const generateSliceScreenshotApiClient = (
  sliceName: string,
  libraryName: string
): Promise<AxiosResponse<ScreenshotResponse>> => {
  return axios.get(
    `/api/screenshot?sliceName=${sliceName}&libraryName=${libraryName}`,
    defaultAxiosConfig
  );
};

export const generateSliceCustomScreenshotApiClient = (
  form: FormData
): Promise<AxiosResponse<ScreenshotUI>> => {
  const requestBody = form;
  return axios.post("/api/custom-screenshot", requestBody, defaultAxiosConfig);
};

export const saveSliceApiClient = (
  component: ComponentUI
): Promise<AxiosResponse<Record<string, never>>> => {
  const requestBody = {
    sliceName: component.model.name,
    from: component.from,
    model: component.model,
    mockConfig: component.mockConfig,
  };
  return axios.post("/api/slices/save", requestBody, defaultAxiosConfig);
};

export const pushSliceApiClient = (
  component: ComponentUI
): Promise<Record<string, string | null>> => {
  return axios
    .get<Record<string, string | null>>(
      `/api/slices/push?sliceName=${component.model.name}&from=${component.from}`,
      defaultAxiosConfig
    )
    .then((response) => response.data);
};

/** Auth Routes **/

export const startAuth = (): Promise<AxiosResponse<Record<string, never>>> =>
  axios.post("/api/auth/start", {}, defaultAxiosConfig);

export const checkAuthStatus = (): Promise<CheckAuthStatusResponse> =>
  axios
    .post("/api/auth/status", {}, defaultAxiosConfig)
    .then((r: AxiosResponse<CheckAuthStatusResponse>) => r.data);

/** Simulator Routes **/

export const checkSimulatorSetup = (): Promise<
  AxiosResponse<SimulatorCheckResponse>
> => axios.get(`/api/simulator/check`);
