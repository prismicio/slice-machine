import type { SharedSliceModel } from "@prismicio/types";
import { SharedSliceContent } from "@prismicio/types-internal/lib/content";
import { HookError } from "../lib/HookSystem";

import type {
	ExtendSliceMachineHook,
	SliceMachinePluginOptions,
	SliceMachineHook,
} from "../types";

/**
 * Data provided to `slice:update` hook handlers.
 */
export type SliceUpdateHookData = {
	libraryID: string;
	model: SharedSliceModel;
	mocks?: SharedSliceContent[];
};

/**
 * Return value for `slice:update` hook handlers.
 */
export type SliceUpdateHookReturnType = {
	mocks: SharedSliceContent[] | undefined;
	errors: HookError[];
};

/**
 * Base version of a `slice:update` hook handler without plugin runner context.
 *
 * @internal
 */
export type SliceUpdateHookBase = SliceMachineHook<
	SliceUpdateHookData,
	SliceUpdateHookReturnType
>;

/**
 * Handler for the `slice:update` hook. The hook is called when a Slice is
 * updated.
 *
 * `slice:update` is not called the first time a Slice is saved. The
 * `slice:create` hook is called instead.
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type SliceUpdateHook<
	TPluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> = ExtendSliceMachineHook<SliceUpdateHookBase, TPluginOptions>;
