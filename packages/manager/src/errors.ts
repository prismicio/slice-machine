// const Errors = {
// 	1000: {
// 		message: "Could not refresh token",
// 		description:
// 			"You are not logged in. Log in before refreshing your authentication token.",
// 	},
// 	1001: {
// 		message: "Failed to refresh authentication token",
// 		description:
// 			"The Prismic Authentication service returned an invalid response.",
// 	},
// 	1002: {
// 		message: "Failed to refresh authentication token",
// 		description:
// 			"You are not logged in. Log in before attempting to get your authentication token.",
// 	},
// 	// 1000: {
// 	// 	message: "Unauthenticated",
// 	// 	description:
// 	// 		"Unable to access the Prismic Custom Types API. Log in to fix this issue.",
// 	// },
// 	// 1001: {
// 	// 	message: "Unauthorized",
// 	// 	description:
// 	// 		"Unable to access the Prismic Custom Types API. Grant the user access to the repository to fix this issue.",
// 	// },
// } as const;
// type Errors = typeof Errors;

import { HookError } from "@slicemachine/plugin-kit";

// const InternalErrorCodes = {
// 	Unauthorized: "Unauthorized",
// 	Unauthenticated: "Unauthenticated",
// 	InternalServerError: "InternalServerError",
// } as const;
// type InternalErrorCodes =
// 	typeof InternalErrorCodes[keyof typeof InternalErrorCodes];

// type InternalErrorCode =
// 	| typeof InternalError.Unauthorized
// 	| typeof InternalError.Unauthenticated
// 	| typeof InternalError.InternalServerError;

// type InternalErrorArgs = {
// 	message?: string;
// 	cause?: Error;
// };

export abstract class SliceMachineError extends Error {
	_sliceMachineError = true;
	name = "SliceMachineError";
}
export class UnauthorizedError extends SliceMachineError {
	name = "UnauthorizedError";
}
export class UnauthenticatedError extends SliceMachineError {
	name = "UnauthenticatedError";
	message = "Authenticate before trying again.";
}
export class NotFoundError extends SliceMachineError {
	name = "NotFoundError";
}
export class UnexpectedDataError extends SliceMachineError {
	name = "UnexpectedDataError";
}
export class InternalError extends SliceMachineError {
	name = "InternalError";
}
export class PluginError extends SliceMachineError {
	name = "PluginError";
}
export class PluginHookResultError extends SliceMachineError {
	name = "PluginHookResultError";

	constructor(errors: HookError[]) {
		super(
			`${errors.length} error${
				errors.length === 1 ? "" : "s"
			} were returned by one or more plugins.`,
			{
				cause: errors,
			},
		);
	}
}

export const isSliceMachineError = (
	error: unknown,
): error is SliceMachineError => {
	return (
		typeof error === "object" && error !== null && "_sliceMachineError" in error
	);
};

export const isUnauthorizedError = (
	error: unknown,
): error is UnauthorizedError => {
	return isSliceMachineError(error) && error.name === UnauthorizedError.name;
};

export const isUnauthenticatedError = (
	error: unknown,
): error is UnauthenticatedError => {
	return isSliceMachineError(error) && error.name === UnauthenticatedError.name;
};

export const isNotFoundError = (error: unknown): error is NotFoundError => {
	return isSliceMachineError(error) && error.name === NotFoundError.name;
};

export const isUnexpectedDataError = (
	error: unknown,
): error is UnexpectedDataError => {
	return isSliceMachineError(error) && error.name === UnexpectedDataError.name;
};

export const isInternalError = (error: unknown): error is InternalError => {
	return isSliceMachineError(error) && error.name === InternalError.name;
};

// export class InternalError<TCode extends InternalErrorCode> extends Error {
// 	static Unauthorized = "Unauthorized" as const;
// 	static Unauthenticated = "Unauthenticated" as const;
// 	static InternalServerError = "InternalServerError" as const;
//
// 	code: TCode;
// 	cause?: Error;
//
// 	constructor(code: TCode, args: InternalErrorArgs = {}) {
// 		super(args.message);
//
// 		this.code = code;
// 		this.cause = args.cause;
//
// 		// const error = Errors[code];
//
// 		// this.message = error.message as TMessage;
//
// 		// if ("description" in error) {
// 		// 	this.description = error.description as TDescription;
// 		// } else {
// 		// 	this.description = undefined as TDescription;
// 		// }
// 	}
// }
