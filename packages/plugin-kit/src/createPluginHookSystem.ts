import { HookSystem } from "./lib/HookSystem";
import type { PluginHooks } from "./types";

/**
 * @internal
 */
export const createPluginHookSystem = (): HookSystem<PluginHooks> => {
	return new HookSystem<PluginHooks>();
};
