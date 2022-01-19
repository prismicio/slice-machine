import axios, { AxiosResponse } from "axios";
import { CheckAuthStatusResponse } from "@models/common/Auth";
import { SimulatorCheckResponse } from "@models/common/Simulator";

const defaultAxiosConfig = {
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
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
