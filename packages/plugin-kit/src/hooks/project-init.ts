import type {
	ExtendSliceMachineHook,
	SliceMachinePluginOptions,
	SliceMachineHook,
} from "../types";

/**
 * Data provided to `project:init` hook handlers.
 */
export type ProjectInitHookData = {
	/**
	 * Log messages. The message may be sent to the console or elsewhere.
	 */
	log: (message: string) => void;
	/**
	 * Install package dependencies. The correct package manager will
	 * automatically be used (npm/Yarn/pnpm/etc.).
	 */
	installDependencies: (args: {
		dependencies: Record<string, string>;
		dev?: boolean;
	}) => Promise<void>;
};

/**
 * Return value for `project:init` hook handlers.
 */
export type ProjectInitHookReturnType = void;

/**
 * Base version of `project:init` without plugin runner context.
 *
 * @internal
 */
export type ProjectInitHookBase = SliceMachineHook<
	ProjectInitHookData,
	ProjectInitHookReturnType
>;

/**
 * Handler for the `project:init` hook. The hook is called during the Slice
 * Machine init Project for plugins to init
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type ProjectInitHook<
	TPluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> = ExtendSliceMachineHook<ProjectInitHookBase, TPluginOptions>;
