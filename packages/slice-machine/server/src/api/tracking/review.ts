import getEnv from "../services/getEnv";
import { TrackingReviewRequest } from "@lib/models/common/TrackingEvent";

export default async function handler(
  requestBody: TrackingReviewRequest
): Promise<{ status: number }> {
  try {
    const { env } = await getEnv();
    const res = await env.client.sendReview({
      framework: env.framework,
      comment: requestBody.comment,
      rating: requestBody.rating,
    });
    return { status: res.status };
  } catch (e) {
    return { status: e.status };
  }
}
