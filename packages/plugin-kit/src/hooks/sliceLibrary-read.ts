import type {
	ExtendSliceMachineHook,
	SliceMachinePluginOptions,
	SliceLibrary,
	SliceMachineHook,
} from "../types";

/**
 * Data provided to `slice-library:read` hook handlers.
 */
export type SliceLibraryReadHookData = {
	libraryID: string;
};

/**
 * Return value for `slice-library:read` hook handlers.
 */
export type SliceLibraryReadHookReturnType = SliceLibrary & {
	sliceIDs: string[];
};

/**
 * Base version of a `slice-library:read` hook handler without plugin runner
 * context.
 *
 * @internal
 */
export type SliceLibraryReadHookBase = SliceMachineHook<
	SliceLibraryReadHookData,
	SliceLibraryReadHookReturnType
>;

/**
 * Handler for the `slice-library:read` hook. The hook is called when a Slice
 * Library's metadata is needed.
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type SliceLibraryReadHook<
	TPluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> = ExtendSliceMachineHook<SliceLibraryReadHookBase, TPluginOptions>;
