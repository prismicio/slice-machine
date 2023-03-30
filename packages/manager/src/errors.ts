import { HookError } from "@slicemachine/plugin-kit";

export class SliceMachineError extends Error {
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
	// TODO: Discuss a stronger way to serialize error for the client to detect with r19
	// @ts-expect-error We don't want to add "dom" to tsconfig "lib" because of the TODO
	if (typeof window !== "undefined") {
		return typeof error === "object" && error !== null;
	} else {
		return (
			typeof error === "object" &&
			error !== null &&
			"_sliceMachineError" in error
		);
	}
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
