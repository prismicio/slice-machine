import axios, { AxiosResponse } from "axios";
import {
  OnboardingContinueEvent,
  OnboardingContinueWithVideoEvent,
  OnboardingSkipEvent,
  OnboardingStartEvent,
  TrackingResponse,
} from "@models/common/TrackingEvent";
import { CheckAuthStatusResponse } from "@models/common/Auth";
import { PreviewCheckResponse } from "@models/common/Preview";

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

export const checkAuthStatus = (): Promise<
  AxiosResponse<CheckAuthStatusResponse>
> => axios.post("/api/auth/status", {}, defaultAxiosConfig);

/** Tracking Routes **/

export const sendTrackingOnboarding = (
  onboardingEvent:
    | OnboardingStartEvent
    | OnboardingSkipEvent
    | OnboardingContinueEvent
    | OnboardingContinueWithVideoEvent
): Promise<AxiosResponse<TrackingResponse>> =>
  axios.post(`/api/tracking/onboarding`, onboardingEvent, defaultAxiosConfig);

/** Preview Routes **/

export const checkPreviewSetup = (): Promise<
  AxiosResponse<PreviewCheckResponse>
> => axios.get(`/api/preview/check`);
