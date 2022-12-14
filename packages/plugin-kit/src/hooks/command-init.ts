import type {
	ExtendSliceMachineHook,
	SliceMachinePluginOptions,
	SliceMachineHook,
} from "../types";

/**
 * Data provided to `command:init` hook handlers.
 */
export type CommandInitHookData = {
	log: (message: string) => void;
	installDependencies: (args: {
		dependencies: Record<string, string>;
		dev?: boolean;
	}) => Promise<void>;
};

/**
 * Return value for `command:init` hook handlers.
 */
export type CommandInitHookReturnType = void;

/**
 * Base version of `command:init` without plugin runner context.
 *
 * @internal
 */
export type CommandInitHookBase = SliceMachineHook<
	CommandInitHookData,
	CommandInitHookReturnType
>;

/**
 * Handler for the `command:init` hook. The hook is called during the Slice
 * Machine init command for plugins to init
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type CommandInitHook<
	TPluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> = ExtendSliceMachineHook<CommandInitHookBase, TPluginOptions>;
