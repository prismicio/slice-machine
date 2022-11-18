import { SliceMachineManager } from "./managers/SliceMachineManager";

export const createSliceMachineManager = (): SliceMachineManager => {
	return new SliceMachineManager();
};
