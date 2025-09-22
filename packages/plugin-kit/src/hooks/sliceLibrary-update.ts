import type {
	ExtendSliceMachineHook,
	SliceMachinePluginOptions,
	SliceMachineHook,
} from "../types";

/**
 * Data provided to `slice-library:update` hook handlers.
 */
export type SliceLibraryUpdateHookData = {
	libraryID: string;
};

/**
 * Return value for `slice-library:update` hook handlers.
 */
export type SliceLibraryUpdateHookReturnType = void;

/**
 * Base version of a `slice-library:update` hook handler without plugin runner
 * context.
 *
 * @internal
 */
export type SliceLibraryUpdateHookBase = SliceMachineHook<
	SliceLibraryUpdateHookData,
	SliceLibraryUpdateHookReturnType
>;

/**
 * Handler for the `slice-library:update` hook. The hook is called when a Slice
 * Library needs to be updated (e.g., to regenerate index files).
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type SliceLibraryUpdateHook<
	TPluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> = ExtendSliceMachineHook<SliceLibraryUpdateHookBase, TPluginOptions>;
