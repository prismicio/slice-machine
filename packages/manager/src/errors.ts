import { HookError } from "@slicemachine/plugin-kit";

export class SliceMachineError extends Error {
	name = "SMSliceMachineError";
}
export class UnauthorizedError extends SliceMachineError {
	name = "SMUnauthorizedError" as const;
}
export class UnauthenticatedError extends SliceMachineError {
	name = "SMUnauthenticatedError" as const;
	message = "Authenticate before trying again.";
}
export class NotFoundError extends SliceMachineError {
	name = "SMNotFoundError" as const;
}
export class UnexpectedDataError extends SliceMachineError {
	name = "SMUnexpectedDataError" as const;
}
export class InternalError extends SliceMachineError {
	name = "SMInternalError" as const;
}
export class PluginError extends SliceMachineError {
	name = "SMPluginError" as const;
}
export class PluginHookResultError extends SliceMachineError {
	name = "SMPluginHookResultError" as const;

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
export class InvalidActiveEnvironmentError extends SliceMachineError {
	name = "SMInvalidActiveEnvironmentError" as const;
}
export class UnsupportedError extends SliceMachineError {
	name = "SMUnsupportedError" as const;
}

type SliceMachineErrorNames =
	| "SMSliceMachineError"
	| UnauthorizedError["name"]
	| UnauthenticatedError["name"]
	| NotFoundError["name"]
	| UnexpectedDataError["name"]
	| InternalError["name"]
	| PluginError["name"]
	| PluginHookResultError["name"]
	| InvalidActiveEnvironmentError["name"]
	| UnsupportedError["name"];

type ShallowSliceMachineError<TName extends SliceMachineErrorNames> = Error & {
	name: TName;
};

export const isSliceMachineError = <TName extends SliceMachineErrorNames>(
	error: unknown,
	name?: TName,
): error is TName extends string ? ShallowSliceMachineError<TName> : Error => {
	const isErrorInstance = error instanceof Error;

	return name === undefined
		? isErrorInstance && error.name.startsWith("SM")
		: isErrorInstance && error.name === name;
};

export const isUnauthorizedError = (
	error: unknown,
): error is ShallowSliceMachineError<"SMUnauthorizedError"> => {
	return isSliceMachineError(error, "SMUnauthorizedError");
};

export const isUnauthenticatedError = (
	error: unknown,
): error is ShallowSliceMachineError<"SMUnauthenticatedError"> => {
	return isSliceMachineError(error, "SMUnauthenticatedError");
};

export const isNotFoundError = (
	error: unknown,
): error is ShallowSliceMachineError<"SMNotFoundError"> => {
	return isSliceMachineError(error, "SMNotFoundError");
};

export const isUnexpectedDataError = (
	error: unknown,
): error is ShallowSliceMachineError<"SMUnexpectedDataError"> => {
	return isSliceMachineError(error, "SMUnexpectedDataError");
};

export const isInternalError = (
	error: unknown,
): error is ShallowSliceMachineError<"SMInternalError"> => {
	return isSliceMachineError(error, "SMInternalError");
};

export const isPluginError = (
	error: unknown,
): error is ShallowSliceMachineError<"SMPluginError"> => {
	return isSliceMachineError(error, "SMPluginError");
};

export const isInvalidActiveEnvironmentError = (
	error: unknown,
): error is ShallowSliceMachineError<"SMInvalidActiveEnvironmentError"> => {
	return isSliceMachineError(error, "SMInvalidActiveEnvironmentError");
};

export const isUnsupportedError = (
	error: unknown,
): error is ShallowSliceMachineError<"SMUnsupportedError"> => {
	return isSliceMachineError(error, "SMUnsupportedError");
};
