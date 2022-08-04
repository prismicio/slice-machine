import type { ApiError } from "../../../../lib/models/server/ApiResult";

export const onError = (
  message = "Unspecified error occurred.",
  status?: number
): ApiError => ({
  err: new Error(message),
  status: status || 500,
  reason: message,
});
