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
): Promise<AxiosResponse> => {
  const requestBody: SaveCustomTypeBody = {
    model: customType,
    mockConfig: mockConfig,
  };

  return axios.post("/api/custom-types/save", requestBody, defaultAxiosConfig);
};

/** Slice Routes **/

export const saveSlice = (
  sliceName: string,
  from: string
): Promise<{ variationId: string }> => {
  return axios
    .get(
      `/api/slices/create?sliceName=${sliceName}&from=${from}`,
      defaultAxiosConfig
    )
    .then((r: AxiosResponse<{ variationId: string }>) => r.data);
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
