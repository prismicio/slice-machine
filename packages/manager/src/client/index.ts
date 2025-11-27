// This file defines the `@prismicio/manager/client` export.
// All exports must be designed for non-Node.js usage.

export { createPrismicManagerClient } from "../managers/createPrismicManagerClient";
export type {
	CreatePrismicManagerClientArgs,
	PrismicManagerClient,
} from "../managers/createPrismicManagerClient";

export type { PrismicManagerPushSliceReturnType } from "../managers/slices/SlicesManager";

export {
	InternalError,
	NotFoundError,
	PrismicError,
	UnauthenticatedError,
	UnauthorizedError,
	UnexpectedDataError,
	isInternalError,
	isNotFoundError,
	isPluginError,
	isPrismicError,
	isUnauthenticatedError,
	isUnauthorizedError,
	isUnexpectedDataError,
	isUnsupportedError,
} from "../errors";

export { DecodeError } from "../lib/DecodeError";
