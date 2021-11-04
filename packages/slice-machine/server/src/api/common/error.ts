import { FakeResponse } from "@lib/models/common/http/FakeClient";

export const onError = (
  r: Response | FakeResponse | null,
  message = "Unspecified error occurred."
): {
  err: Response | FakeResponse | Error;
  status: number;
  reason: string;
} => ({
  err: r || new Error(message),
  status: r && r.status ? r.status : 500,
  reason: message,
});
