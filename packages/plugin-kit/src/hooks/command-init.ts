import type {
	ExtendSliceMachineHook,
	SliceMachinePluginOptions,
	SliceMachineHook,
} from "../types";

/**
 * Install package dependencies. The correct package manager will automatically
 * be used (npm/Yarn/pnpm/etc.).
 */
export type InstallDependenciesFunction = (args: {
	dependencies: Record<string, string>;
	dev?: boolean;
}) => Promise<void>;

/**
 * Data provided to `command:init` hook handlers.
 */
export type CommandInitHookData = {
	log: (message: string) => void;
	installDependencies: InstallDependenciesFunction;
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
