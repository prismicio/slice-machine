import type { CustomType } from "@prismicio/types-internal/lib/customtypes";

import type {
	ExtendSliceMachineHook,
	SliceMachinePluginOptions,
	SliceMachineHook,
} from "../types";

/**
 * Data provided to `custom-type:create` hook handlers.
 */
export type CustomTypeCreateHookData = {
	model: CustomType;
};

/**
 * Return value for `custom-type:create` hook handlers.
 */
export type CustomTypeCreateHookReturnType = void;

/**
 * Base version of `custom-type:create` without plugin runner context.
 *
 * @internal
 */
export type CustomTypeCreateHookBase = SliceMachineHook<
	CustomTypeCreateHookData,
	CustomTypeCreateHookReturnType
>;

/**
 * Handler for the `custom-type:create` hook. The hook is called when a Custom
 * Type is created.
 *
 * `custom-type:create` is only called the first time a Custom Type is saved.
 * Subsequent saves will call the `custom-type:update` hook.
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type CustomTypeCreateHook<
	TPluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> = ExtendSliceMachineHook<CustomTypeCreateHookBase, TPluginOptions>;
