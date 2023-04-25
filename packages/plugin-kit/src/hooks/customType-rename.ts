import type { CustomType } from "@prismicio/types-internal/lib/customtypes";

import type {
	ExtendSliceMachineHook,
	SliceMachinePluginOptions,
	SliceMachineHook,
} from "../types";

/**
 * Data provided to `custom-type:rename` hook handlers.
 */
export type CustomTypeRenameHookData = {
	model: CustomType;
};

/**
 * Return value for `custom-type:rename` hook handlers.
 */
export type CustomTypeRenameHookReturnType = void;

/**
 * Base version of a `custom-type:rename` hook handler without plugin runner
 * context.
 *
 * @internal
 */
export type CustomTypeRenameHookBase = SliceMachineHook<
	CustomTypeRenameHookData,
	CustomTypeRenameHookReturnType
>;

/**
 * Handler for the `custom-type:rename` hook. The hook is called when a Custom
 * Type is renamed.
 *
 * `custom-type:rename` is not called the first time a Custom Type is saved. The
 * `custom-type:create` hook is called instead.
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type CustomTypeRenameHook<
	TPluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> = ExtendSliceMachineHook<CustomTypeRenameHookBase, TPluginOptions>;
