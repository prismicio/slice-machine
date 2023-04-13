import type { CustomType } from "@prismicio/types-internal/lib/customtypes";

import type {
	ExtendSliceMachineHook,
	SliceMachinePluginOptions,
	SliceMachineHook,
} from "../types";

/**
 * Data provided to `custom-type:delete` hook handlers.
 */
export type CustomTypeDeleteHookData = {
	model: CustomType;
};

/**
 * Return value for `custom-type:delete` hook handlers.
 */
export type CustomTypeDeleteHookReturnType = void;

/**
 * Base version of a `custom-type:delete` hook handler without plugin runner
 * context.
 *
 * @internal
 */
export type CustomTypeDeleteHookBase = SliceMachineHook<
	CustomTypeDeleteHookData,
	CustomTypeDeleteHookReturnType
>;

/**
 * Handler for the `custom-type:delete` hook. The hook is called when a Custom
 * Type is deleted.
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type CustomTypeDeleteHook<
	TPluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> = ExtendSliceMachineHook<CustomTypeDeleteHookBase, TPluginOptions>;
