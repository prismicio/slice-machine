import { ApiError } from "./ApiError";

export type SyncError = { type: "custom type" | "slice"; error: ApiError };
