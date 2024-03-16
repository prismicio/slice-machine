// This file defines the `@slicemachine/manager/client` export.
// All exports must be designed for non-Node.js usage.

export { createSliceMachineManagerClient } from "../managers/createSliceMachineManagerClient";
export type {
	CreateSliceMachineManagerClientArgs,
	SliceMachineManagerClient,
} from "../managers/createSliceMachineManagerClient";

export { GIT_PROVIDER, type GitProvider } from "../constants/GIT_PROVIDER";

export type { Environment } from "../managers/prismicRepository/types";

export type { SliceMachineManagerPushSliceReturnType } from "../managers/slices/SlicesManager";

export {
	InternalError,
	NotFoundError,
	SliceMachineError,
	UnauthenticatedError,
	UnauthorizedError,
	UnexpectedDataError,
	isInternalError,
	isNotFoundError,
	isPluginError,
	isSliceMachineError,
	isUnauthenticatedError,
	isUnauthorizedError,
	isUnexpectedDataError,
	isInvalidActiveEnvironmentError,
	isUnsupportedError,
} from "../errors";

export { DecodeError } from "../lib/DecodeError";
