import { SliceMachineError, isSliceMachineError } from "@slicemachine/misc";

export class UnauthenticatedError extends SliceMachineError {}
export const isUnauthenticatedError = (
	error: unknown,
): error is UnauthenticatedError => {
	return isSliceMachineError(error) && error.name === UnauthenticatedError.name;
};

export class UnexpectedDataError extends SliceMachineError {}
export const isUnexpectedDataError = (
	error: unknown,
): error is UnexpectedDataError => {
	return isSliceMachineError(error) && error.name === UnexpectedDataError.name;
};
