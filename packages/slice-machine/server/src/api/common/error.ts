import { FakeResponse } from "@lib/models/common/http/FakeClient";
import { ApiError } from "@models/server/ApiResult";

export const onError = (
  r: Response | FakeResponse | null,
  message = "Unspecified error occurred."
): ApiError => ({
  err: r || new Error(message),
  status: r && r.status ? r.status : 500,
  reason: message,
});
