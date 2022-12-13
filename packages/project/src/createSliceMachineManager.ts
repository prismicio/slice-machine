import { SliceMachineManager } from "./SliceMachineManager";

type CreateSliceMachineManager = ConstructorParameters<
	typeof SliceMachineManager
>[0];

export const createSliceMachineManager = (
	args: CreateSliceMachineManager,
): SliceMachineManager => {
	return new SliceMachineManager(args);
};
