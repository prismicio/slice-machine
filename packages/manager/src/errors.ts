import { HookError } from "@prismicio/plugin-kit";

export class PrismicError extends Error {
	name = "SMPrismicError";
}
export class UnauthorizedError extends PrismicError {
	name = "SMUnauthorizedError" as const;
}
export class UnauthenticatedError extends PrismicError {
	name = "SMUnauthenticatedError" as const;
	message = "Authenticate before trying again.";
}
export class NotFoundError extends PrismicError {
	name = "SMNotFoundError" as const;
}
export class UnexpectedDataError extends PrismicError {
	name = "SMUnexpectedDataError" as const;
}
export class InternalError extends PrismicError {
	name = "SMInternalError" as const;
}
export class PluginError extends PrismicError {
	name = "SMPluginError" as const;
}
export class PluginHookResultError extends PrismicError {
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
export class UnsupportedError extends PrismicError {
	name = "SMUnsupportedError" as const;
}

type PrismicErrorNames =
	| "SMPrismicError"
	| UnauthorizedError["name"]
	| UnauthenticatedError["name"]
	| NotFoundError["name"]
	| UnexpectedDataError["name"]
	| InternalError["name"]
	| PluginError["name"]
	| PluginHookResultError["name"]
	| UnsupportedError["name"];

type ShallowPrismicError<TName extends PrismicErrorNames> = Error & {
	name: TName;
};

export const isPrismicError = <TName extends PrismicErrorNames>(
	error: unknown,
	name?: TName,
): error is TName extends string ? ShallowPrismicError<TName> : Error => {
	const isErrorInstance = error instanceof Error;

	return name === undefined
		? isErrorInstance && error.name.startsWith("SM")
		: isErrorInstance && error.name === name;
};

export const isUnauthorizedError = (
	error: unknown,
): error is ShallowPrismicError<"SMUnauthorizedError"> => {
	return isPrismicError(error, "SMUnauthorizedError");
};

export const isUnauthenticatedError = (
	error: unknown,
): error is ShallowPrismicError<"SMUnauthenticatedError"> => {
	return isPrismicError(error, "SMUnauthenticatedError");
};

export const isNotFoundError = (
	error: unknown,
): error is ShallowPrismicError<"SMNotFoundError"> => {
	return isPrismicError(error, "SMNotFoundError");
};

export const isUnexpectedDataError = (
	error: unknown,
): error is ShallowPrismicError<"SMUnexpectedDataError"> => {
	return isPrismicError(error, "SMUnexpectedDataError");
};

export const isInternalError = (
	error: unknown,
): error is ShallowPrismicError<"SMInternalError"> => {
	return isPrismicError(error, "SMInternalError");
};

export const isPluginError = (
	error: unknown,
): error is ShallowPrismicError<"SMPluginError"> => {
	return isPrismicError(error, "SMPluginError");
};

export const isUnsupportedError = (
	error: unknown,
): error is ShallowPrismicError<"SMUnsupportedError"> => {
	return isPrismicError(error, "SMUnsupportedError");
};
