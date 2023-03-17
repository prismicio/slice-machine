import type {
	ExtendSliceMachineHook,
	SliceMachinePluginOptions,
	SliceMachineHook,
} from "../types";

/**
 * Data provided to `debug` hook handlers.
 */
export type DebugHookData = unknown;

/**
 * Return value for `debug` hook handlers.
 */
export type DebugHookReturnType = unknown;

/**
 * Base version of a `debug` hook handler without plugin runner context.
 *
 * @internal
 */
export type DebugHookBase = SliceMachineHook<
	DebugHookData,
	DebugHookReturnType
>;

/**
 * Handler for the `debug` hook. This hook is never called in a production app.
 * It can be used for testing purposes.
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type DebugHook<
	TPluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> = ExtendSliceMachineHook<DebugHookBase, TPluginOptions>;
