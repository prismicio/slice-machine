import type {
	ExtendSliceMachineHook,
	SliceMachinePluginOptions,
	SliceMachineHook,
} from "../types";

/**
 * Data provided to `project:environment:read` hook handlers.
 */
export type ProjectEnvironmentReadHookData = undefined;

/**
 * Return value for `project:environment:read` hook handlers.
 */
export type ProjectEnvironmentReadHookReturnType = {
	/**
	 * The project's current environment. Set to `undefined` if using the
	 * production environment.
	 */
	environment: undefined | string;
};

/**
 * Base version of `project:environment:read` without plugin runner context.
 *
 * @internal
 */
export type ProjectEnvironmentReadHookBase = SliceMachineHook<
	ProjectEnvironmentReadHookData,
	ProjectEnvironmentReadHookReturnType
>;

/**
 * Handler for the `project:environment:read` hook. The hook is called when a
 * project's environment needs to be read.
 *
 * This hook is **required** to be implemented by adapters.
 *
 * This hook will only be called in adapters.
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type ProjectEnvironmentReadHook<
	TPluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> = ExtendSliceMachineHook<ProjectEnvironmentReadHookBase, TPluginOptions>;
