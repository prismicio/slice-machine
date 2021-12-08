import getEnv from "../services/getEnv";
import { FakeResponse } from "@lib/models/common/http/FakeClient";
import {
  OnboardingStartEvent,
  OnboardingSkipEvent,
  OnboardingContinueEvent,
  OnboardingContinueWithVideoEvent,
} from "@lib/models/common/TrackingEvent";

export default async function (
  query:
    | OnboardingStartEvent
    | OnboardingSkipEvent
    | OnboardingContinueEvent
    | OnboardingContinueWithVideoEvent
): Promise<{ err: Response | FakeResponse | null }> {
  const { env } = await getEnv();

  try {
    const res = await env.client.sendOnboarding(query);

    if (res.status && Math.floor(res.status / 100) !== 2) {
      return { err: res };
    }
    return { err: null };
  } catch (e) {
    return { err: e };
  }
}
