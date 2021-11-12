import axios, { AxiosResponse } from "axios";
import {
  OnboardingContinueEvent,
  OnboardingContinueWithVideoEvent,
  OnboardingSkipEvent,
  OnboardingStartEvent,
  TrackingReviewResponse,
} from "@models/common/TrackingEvent";
import { CheckAuthStatusResponse } from "@models/common/Auth";

const jsonHeaders = {
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
};

/** Auth Routes **/

export const startAuth = (): Promise<AxiosResponse<{}>> =>
  axios.post("/api/auth/start", {}, jsonHeaders);

export const checkAuthStatus = (): Promise<
  AxiosResponse<CheckAuthStatusResponse>
> => axios.post("/api/auth/status", {}, jsonHeaders);

/** Tracking Routes **/

export const sendTrackingReview = (
  rating: number,
  comment: string
): Promise<AxiosResponse<TrackingReviewResponse>> =>
  axios.post(`/api/tracking/review`, { rating, comment }, jsonHeaders);

export const sendTrackingOnboarding = (
  onboardingEvent:
    | OnboardingStartEvent
    | OnboardingSkipEvent
    | OnboardingContinueEvent
    | OnboardingContinueWithVideoEvent
): Promise<AxiosResponse<TrackingReviewResponse>> =>
  axios.post(`/api/tracking/onboarding`, onboardingEvent, jsonHeaders);
