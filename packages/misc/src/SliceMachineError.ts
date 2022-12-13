export abstract class SliceMachineError extends Error {
	_sliceMachineError = true;
}

export const isSliceMachineError = (
	error: unknown,
): error is SliceMachineError => {
	return (
		typeof error === "object" && error !== null && "_sliceMachineError" in error
	);
};
