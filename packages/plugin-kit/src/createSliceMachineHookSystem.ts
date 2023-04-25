import { HookSystem } from "./lib/HookSystem";
import type { SliceMachineHooks } from "./types";

/**
 * @internal
 */
export const createSliceMachineHookSystem =
	(): HookSystem<SliceMachineHooks> => {
		return new HookSystem<SliceMachineHooks>();
	};
