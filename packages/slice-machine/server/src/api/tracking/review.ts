import { getEnv } from "@lib/env";
import { TrackingEventId } from "@lib/models/common/TrackingEvent";
import { FakeResponse } from "@models/common/http/FakeClient";

export default async function handler(query: {
  rating: number;
  comment: string;
}): Promise<{ err: FakeResponse | Response | null }> {
  try {
    const { env } = await getEnv();
    const res = await env.client.sendReview({
      id: TrackingEventId.REVIEW,
      framework: env.framework,
      ...query,
    });
    if (res.status !== 200) {
      return { err: res };
    }
    return { err: null };
  } catch (e) {
    return { err: e };
  }
}
