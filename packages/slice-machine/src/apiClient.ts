import axios, { AxiosResponse } from "axios";
import { CheckAuthStatusResponse } from "@models/common/Auth";
import { SimulatorCheckResponse } from "@models/common/Simulator";
import { SaveCustomTypeBody } from "@models/common/CustomType";
import { CustomTypeMockConfig } from "@models/common/MockConfig";
import { SliceBody } from "@models/common/Slice";
import ServerState from "@models/server/ServerState";
import { CustomTypeSM } from "@slicemachine/core/build/src/models/CustomType";

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
