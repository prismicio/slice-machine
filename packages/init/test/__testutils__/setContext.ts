import { SliceMachineInitProcess } from "../../src";

export const setContext = (
	initProcess: SliceMachineInitProcess,
	context: SliceMachineInitProcess["context"],
): void => {
	// @ts-expect-error - Accessing protected property
	initProcess.context = context;
};
