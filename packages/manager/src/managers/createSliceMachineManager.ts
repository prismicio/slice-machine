import { SliceMachineManager } from "./SliceMachineManager";

type CreateSliceMachineManagerArgs = ConstructorParameters<
	typeof SliceMachineManager
>;

export const createSliceMachineManager = (
	...args: CreateSliceMachineManagerArgs
): SliceMachineManager => {
	return new SliceMachineManager(...args);
};
