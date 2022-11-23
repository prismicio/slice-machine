import type {
	ExtendSliceMachineHook,
	SliceMachinePluginOptions,
	SliceMachineHook,
} from "../types";

/**
 * Data provided to `custom-type-library:read` hook handlers.
 */
export type CustomTypeLibraryReadHookData = undefined;

/**
 * Return value for `custom-type-library:read` hook handlers.
 */
export type CustomTypeLibraryReadHookReturnType = {
	ids: string[];
};

/**
 * Base version of a `custom-type-library:read` hook handler without plugin
 * runner context.
 *
 * @internal
 */
export type CustomTypeLibraryReadHookBase = SliceMachineHook<
	CustomTypeLibraryReadHookData,
	CustomTypeLibraryReadHookReturnType
>;

/**
 * Handler for the `custom-type-library:read` hook. The hook is called when a
 * Custom Type Library's metadata is needed.
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type CustomTypeLibraryReadHook<
	TPluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> = ExtendSliceMachineHook<CustomTypeLibraryReadHookBase, TPluginOptions>;
