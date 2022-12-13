import { SliceMachineError, isSliceMachineError } from "./SliceMachineError";

export class InternalError extends SliceMachineError {}
export const isInternalError = (error: unknown): error is InternalError => {
	return isSliceMachineError(error) && error.name === InternalError.name;
};
