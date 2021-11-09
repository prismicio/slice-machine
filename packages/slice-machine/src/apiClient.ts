import { AxiosResponse } from "axios";
import { TrackingReviewResponse } from "@models/common/TrackingEvent";

const axios = require("axios");

const jsonHeaders = {
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
};

const test = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

/** Auth Routes **/

export const startAuth = async () =>
  await fetch("/api/auth/start", { headers: test, method: "POST" });

export const checkAuthStatus = async () => {
  const response = await fetch("/api/auth/status", {
    headers: test,
    method: "POST",
  });

  return response.json();
};

/** Tracking Routes **/

export const sendTrackingReview = (
  rating: number,
  comment: string
): Promise<AxiosResponse<TrackingReviewResponse>> =>
  axios.post(`/api/tracking/review`, { rating, comment }, jsonHeaders);
