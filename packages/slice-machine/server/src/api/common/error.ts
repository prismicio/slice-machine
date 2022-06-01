import { Response } from "node-fetch";
import { ApiError } from "@models/server/ApiResult";

export const onError = (
  r: Response | null,
  message = "Unspecified error occurred."
): ApiError => ({
  err: r || new Error(message),
  status: r && r.status ? r.status : 500,
  reason: message,
});
