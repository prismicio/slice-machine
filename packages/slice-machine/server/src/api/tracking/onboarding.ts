import { getEnv } from "@lib/env";
import { FakeResponse } from "@lib/models/common/http/FakeClient";
import {
  OnboardingStartEvent,
  OnboardingSkipEvent,
  OnboardingContinueEvent,
  OnboardingContinueWithVideoEvent,
} from "@lib/models/common/TrackingEvent";

export class HTTPResponseError extends Error {
  response: Response | FakeResponse;
  constructor(response: Response | FakeResponse) {
    super(`HTTP Error Response: ${response.status} ${response.statusText}`);
    this.response = response;
  }
}

export default async function (
  query:
    | OnboardingStartEvent
    | OnboardingSkipEvent
    | OnboardingContinueEvent
    | OnboardingContinueWithVideoEvent
): Promise<Response | FakeResponse> {
  const { env } = await getEnv();

  return env.client
    .sendOnboarding(query)
    .then((res: Response | FakeResponse) => {
      if (res.status && Math.floor(res.status / 100) !== 2)
        throw new HTTPResponseError(res);
      return res;
    });
}
