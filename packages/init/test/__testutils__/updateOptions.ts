import { SliceMachineInitProcess } from "../../src";

export const updateOptions = (
	initProcess: SliceMachineInitProcess,
	options: SliceMachineInitProcess["options"],
): void => {
	// @ts-expect-error - Accessing protected property
	initProcess.options = {
		// @ts-expect-error - Accessing protected property
		...initProcess.options,
		...options,
	};
};
