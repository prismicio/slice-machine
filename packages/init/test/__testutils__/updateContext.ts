import { SliceMachineInitProcess } from "../../src";

export const updateContext = (
	initProcess: SliceMachineInitProcess,
	context: SliceMachineInitProcess["context"],
): void => {
	// @ts-expect-error - Accessing protected property
	initProcess.context = {
		// @ts-expect-error - Accessing protected property
		...initProcess.context,
		...context,
	};
};
