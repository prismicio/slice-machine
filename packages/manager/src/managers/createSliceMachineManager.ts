import { SliceMachineManager } from "./SliceMachineManager";

type CreateSliceMachineManagerArgs = ConstructorParameters<
	typeof SliceMachineManager
>[0];

export const createSliceMachineManager = (
	args?: CreateSliceMachineManagerArgs,
): SliceMachineManager => {
	return new SliceMachineManager(args);
};
