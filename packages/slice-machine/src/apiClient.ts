import axios, { AxiosResponse } from "axios";
import { CheckAuthStatusResponse } from "@models/common/Auth";
import { SimulatorCheckResponse } from "@models/common/Simulator";
import {
  CustomType,
  ObjectTabs,
  SaveCustomTypeBody,
} from "@models/common/CustomType";
import { CustomTypeMockConfig } from "@models/common/MockConfig";

const defaultAxiosConfig = {
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
};

/** Custom Type Routes **/

export const saveCustomType = (
  customType: CustomType<ObjectTabs>,
  mockConfig: CustomTypeMockConfig
): Promise<AxiosResponse<Record<string, never>>> => {
  const requestBody: SaveCustomTypeBody = {
    model: customType,
    mockConfig: mockConfig,
  };

  return axios.post("/api/custom-types/save", requestBody, defaultAxiosConfig);
};

/** Auth Routes **/

export const startAuth = (): Promise<AxiosResponse<Record<string, never>>> =>
  axios.post("/api/auth/start", {}, defaultAxiosConfig);

export const checkAuthStatus = (): Promise<CheckAuthStatusResponse> =>
  axios
    .post<CheckAuthStatusResponse>("/api/auth/status", {}, defaultAxiosConfig)
    .then((r) => r.data);

/** Simulator Routes **/

export const checkSimulatorSetup = (): Promise<
  AxiosResponse<SimulatorCheckResponse>
> => axios.get(`/api/simulator/check`);
