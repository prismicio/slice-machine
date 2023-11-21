import type {
	ExtendSliceMachineHook,
	SliceMachinePluginOptions,
	SliceMachineHook,
} from "../types";

/**
 * Data provided to `project:environment:update` hook handlers.
 */
export type ProjectEnvironmentUpdateHookData = {
	/**
	 * The project's new environment. `undefined` means the production environment
	 * is being used.
	 */
	environment: undefined | string;
};

/**
 * Return value for `project:environment:update` hook handlers.
 */
export type ProjectEnvironmentUpdateHookReturnType = void;

/**
 * Base version of `project:environment:update` without plugin runner context.
 *
 * @internal
 */
export type ProjectEnvironmentUpdateHookBase = SliceMachineHook<
	ProjectEnvironmentUpdateHookData,
	ProjectEnvironmentUpdateHookReturnType
>;

/**
 * Handler for the `project:environment:update` hook. The hook is called when a
 * project's environment needs to be updated.
 *
 * This hook is **required** to be implemented by adapters.
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type ProjectEnvironmentUpdateHook<
	TPluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> = ExtendSliceMachineHook<ProjectEnvironmentUpdateHookBase, TPluginOptions>;
