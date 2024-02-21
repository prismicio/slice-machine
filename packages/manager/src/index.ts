// This file defines the root `@slicemachine/manager` export.
// Non-Node.js-compatible exports should be defined in `./client.ts`.

export type { CustomTypeFormat } from "./managers/customTypes/types";
export type {
	PrismicRepository,
	FrameworkWroomTelemetryID,
	StarterId,
} from "./managers/prismicRepository/types";

export type { SliceMachineManager } from "./managers/SliceMachineManager";
export { createSliceMachineManager } from "./managers/createSliceMachineManager";
export { createSliceMachineManagerMiddleware } from "./managers/createSliceMachineManagerMiddleware";
export type { CreateSliceMachineManagerMiddlewareArgs } from "./managers/createSliceMachineManagerMiddleware";

export type { GitOwner, GitRepo, GitRepoSpecifier } from "./managers/git/types";

export type {
	Environment,
	PushChangesLimit,
} from "./managers/prismicRepository/types";

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
	InvalidActiveEnvironmentError,
	UnsupportedError,
} from "./errors";

export { getEnvironmentInfo } from "./getEnvironmentInfo";

export { DecodeError } from "./lib/DecodeError";

export type { SliceMachineConfig, PackageManager } from "./types";
export type { APIEndpoints } from "./constants/API_ENDPOINTS";

export { REPOSITORY_NAME_VALIDATION } from "./constants/REPOSITORY_NAME_VALIDATION";

export type { Variant } from "./managers/telemetry/types";

export type { Version, VersionKind } from "./managers/versions/types";
