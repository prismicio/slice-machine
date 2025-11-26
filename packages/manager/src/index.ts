// This file defines the root `@prismicio/manager` export.
// Non-Node.js-compatible exports should be defined in `./client.ts`.

export type { CustomTypeFormat } from "./managers/customTypes/types";
export type { PrismicRepository } from "./managers/prismicRepository/types";

export type { SliceMachineManager } from "./managers/SliceMachineManager";
export { createSliceMachineManager } from "./managers/createSliceMachineManager";
export { createSliceMachineManagerMiddleware } from "./managers/createSliceMachineManagerMiddleware";
export type { CreateSliceMachineManagerMiddlewareArgs } from "./managers/createSliceMachineManagerMiddleware";

export type { PushChangesLimit } from "./managers/prismicRepository/types";

export type {
	PrismicAuthManager,
	PrismicUserProfile,
	PrismicAuthState,
} from "./auth/PrismicAuthManager";
export { createPrismicAuthManager } from "./auth/createPrismicAuthManager";
export { createPrismicAuthManagerMiddleware } from "./auth/createPrismicAuthManagerMiddleware";
export type {
	CreatePrismicAuthManagerMiddlewareArgs,
	PrismicAuthCheckStatusResponse,
} from "./auth/createPrismicAuthManagerMiddleware";

export {
	SliceMachineError,
	UnauthorizedError,
	UnauthenticatedError,
	NotFoundError,
	UnexpectedDataError,
	InternalError,
	PluginError,
	PluginHookResultError,
	UnsupportedError,
} from "./errors";

export { getEnvironmentInfo } from "./getEnvironmentInfo";

export { DecodeError } from "./lib/DecodeError";

export type { PrismicConfig, PackageManager } from "./types";
export type { APIEndpoints } from "./constants/API_ENDPOINTS";

export type { Variant } from "./managers/telemetry/types";
