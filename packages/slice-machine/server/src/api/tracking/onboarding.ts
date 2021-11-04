import { getEnv } from "@lib/env";
import { FakeResponse } from "@lib/models/common/http/FakeClient";
import {
  OnboardingTrackingEvent,
  TrackingEventId,
} from "@lib/models/common/TrackingEvent";

export class HTTPResponseError extends Error {
  response: Response | FakeResponse;
  constructor(response: Response | FakeResponse) {
    super(`HTTP Error Response: ${response.status} ${response.statusText}`);
    this.response = response;
  }
}

export default async function (
  query: Pick<
    OnboardingTrackingEvent,
    "lastStep" | "maxSteps" | "startTime" | "endTime" | "totalTime"
  >
): Promise<Response | FakeResponse> {
  const { env } = await getEnv();

  return env.client
    .sendOnboarding({
      ...query,
      id: TrackingEventId.ONBOARDING,
    })
    .then((res: Response | FakeResponse) => {
      if (res.status && res.status !== 200) throw new HTTPResponseError(res);
      return res;
    });
}
