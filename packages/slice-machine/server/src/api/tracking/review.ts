import getEnv from "../services/getEnv";
import {
  TrackingReviewRequest,
  ReviewTrackingEvent,
  TrackingEventId,
} from "@lib/models/common/TrackingEvent";

export default async function handler(
  requestBody: TrackingReviewRequest
): Promise<{ status: number }> {
  try {
    const { env } = await getEnv();
    const res = await env.client.sendReview({
      id: TrackingEventId.REVIEW,
      framework: env.framework,
      ...requestBody,
    } as ReviewTrackingEvent);
    return { status: res.status };
  } catch (e) {
    return { status: e.status };
  }
}
