export type ApiError = {
  err: Response | Error;
  status: number;
  reason: string;
};

export type ApiResult<
  Expected extends Record<keyof Expected, unknown> = Record<string, never>
> = Expected | ApiError;

export function isApiError<Expected extends Record<keyof Expected, unknown>>(
  payload: ApiResult<Expected>
): payload is ApiError {
  return (
    typeof payload === "object" &&
    payload !== null &&
    payload.hasOwnProperty("err") &&
    payload.hasOwnProperty("status") &&
    payload.hasOwnProperty("reason")
  );
}
