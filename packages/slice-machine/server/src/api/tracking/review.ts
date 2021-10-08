import { getEnv } from "@lib/env";
import { TrackingEventId } from "@lib/models/common/TrackingEvent";

export default async function handler(query: {
  rating: number;
  comment: string;
}) {
  const { env } = await getEnv();

  try {
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
