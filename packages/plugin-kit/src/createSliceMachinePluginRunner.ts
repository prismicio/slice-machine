import * as path from "node:path";
import { createRequire } from "node:module";

import { defu } from "defu";

import { HookSystem } from "./lib/HookSystem";
import { createSliceMachineContext } from "./createSliceMachineContext";
import {
	LoadedSliceMachinePlugin,
	SliceMachinePlugin,
} from "./defineSliceMachinePlugin";
import {
	SliceMachineConfigPluginRegistration,
	SliceMachineHookExtraArgs,
	SliceMachineHookTypes,
	SliceMachineHooks,
	SliceMachineProject,
} from "./types";
import { createSliceMachineHookSystem } from "./createSliceMachineHookSystem";
import {
	createSliceMachineActions,
	SliceMachineActions,
} from "./createSliceMachineActions";
import {
	createSliceMachineHelpers,
	SliceMachineHelpers,
} from "./createSliceMachineHelpers";

/**
 * @internal
 */
export const REQUIRED_ADAPTER_HOOKS: SliceMachineHookTypes[] = [
	"slice:create",
	"slice:read",
	"slice:rename",
	"slice:delete",
	"slice:update",
	"slice:asset:update",
	"slice:asset:read",
	"slice:asset:delete",
	"slice-library:read",
	"custom-type:create",
	"custom-type:read",
	"custom-type:rename",
	"custom-type:delete",
	"custom-type:update",
	"custom-type:asset:update",
	"custom-type:asset:read",
	"custom-type:asset:delete",
	"custom-type-library:read",
];
/**
 * @internal
 */
export const ADAPTER_ONLY_HOOKS: SliceMachineHookTypes[] = [
	"slice:read",
	"slice:asset:read",
	"slice-library:read",
	"custom-type:read",
	"custom-type:asset:read",
	"custom-type-library:read",
	"slice-simulator:setup:read",
];

type SliceMachinePluginRunnerConstructorArgs = {
	project: SliceMachineProject;
	hookSystem: HookSystem<SliceMachineHooks>;
	nativePlugins?: Record<string, SliceMachinePlugin>;
};

/**
 * @internal
 */
export class SliceMachinePluginRunner {
	private _project: SliceMachineProject;
	private _hookSystem: HookSystem<SliceMachineHooks>;
	private _nativePlugins: Record<string, SliceMachinePlugin>;

	/**
	 * Slice Machine actions provided to hooks.
	 *
	 * IMPORTANT: Prefer creating your own abstraction over using `rawActions`
	 * directly to prevent code breakage if this internal API changes.
	 *
	 * @internal
	 */
	rawActions: SliceMachineActions;

	/**
	 * Slice Machine helpers provided to hooks.
	 *
	 * IMPORTANT: Prefer creating your own abstraction over using `rawHelpers`
	 * directly to prevent code breakage if this internal API changes.
	 *
	 * @internal
	 */
	rawHelpers: SliceMachineHelpers;

	// Methods forwarded to the plugin runner's hook system.
	callHook: HookSystem<SliceMachineHooks>["callHook"];
	hooksForOwner: HookSystem<SliceMachineHooks>["hooksForOwner"];
	hooksForType: HookSystem<SliceMachineHooks>["hooksForType"];
	createScope: HookSystem<SliceMachineHooks>["createScope"];

	constructor({
		project,
		hookSystem,
		nativePlugins = {},
	}: SliceMachinePluginRunnerConstructorArgs) {
		this._project = project;
		this._hookSystem = hookSystem;
		this._nativePlugins = nativePlugins;

		this.rawActions = createSliceMachineActions(
			this._project,
			this._hookSystem,
		);
		this.rawHelpers = createSliceMachineHelpers(this._project);

		this.callHook = this._hookSystem.callHook.bind(this._hookSystem);
		this.hooksForOwner = this._hookSystem.hooksForOwner.bind(this._hookSystem);
		this.hooksForType = this._hookSystem.hooksForType.bind(this._hookSystem);
		this.createScope = this._hookSystem.createScope.bind(this._hookSystem);
	}

	private async _loadPlugin(
		pluginRegistration: SliceMachineConfigPluginRegistration,
	): Promise<LoadedSliceMachinePlugin> {
		// Sanitize registration
		const { resolve, options = {} } =
			typeof pluginRegistration === "object" && "resolve" in pluginRegistration
				? pluginRegistration
				: { resolve: pluginRegistration };

		let plugin: SliceMachinePlugin | undefined = undefined;

		if (typeof resolve === "string") {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			try {
				const raw = await createRequire(
					path.resolve(this._project.root, "noop.js"),
				)(resolve);
				plugin = raw.default || raw;
			} catch (error) {
				if (import.meta.env.DEV) {
					console.error(error);
				}
			}

			if (!plugin) {
				// If an installed plugin cannot be resolved, try loading a native plugin.
				plugin = this._nativePlugins[resolve];
			}

			if (!plugin) {
				throw new Error(
					`Could not resolve plugin \`${resolve}\`. Check that it has been installed.`,
				);
			}
		} else {
			plugin = resolve;
		}

		if (!plugin) {
			throw new Error(`Could not load plugin: \`${resolve}\``);
		}

		const mergedOptions = defu(options, plugin.defaultOptions || {});

		return {
			...plugin,
			resolve,
			options: mergedOptions,
		};
	}

	private async _setupPlugin(
		plugin: LoadedSliceMachinePlugin,
		as: "adapter" | "plugin",
	): Promise<void> {
		const context = createSliceMachineContext({
			actions: this.rawActions,
			helpers: this.rawHelpers,
			project: this._project,
			plugin,
		});
		const hookSystemScope =
			this._hookSystem.createScope<SliceMachineHookExtraArgs>(
				plugin.meta.name,
				[context],
			);

		// Prevent plugins from hooking to adapter only hooks
		const hook: typeof hookSystemScope.hook =
			as === "adapter"
				? hookSystemScope.hook
				: (type, hook, ...args) => {
						if (ADAPTER_ONLY_HOOKS.includes(type)) {
							return;
						}

						return hookSystemScope.hook(type, hook, ...args);
				  };

		// Run plugin setup with actions and context
		try {
			await plugin.setup({
				...context,
				hook,
				unhook: hookSystemScope.unhook,
			});
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(
					`Plugin \`${plugin.meta.name}\` errored during setup: ${error.message}`,
					{ cause: error },
				);
			} else {
				throw new Error(
					`Plugin \`${plugin.meta.name}\` errored during setup: ${error}`,
				);
			}
		}
	}

	private _validateAdapter(adapter: LoadedSliceMachinePlugin): void {
		const hooks = this._hookSystem.hooksForOwner(adapter.meta.name);
		const hookTypes = hooks.map((hook) => hook.meta.type);

		const missingHooks = REQUIRED_ADAPTER_HOOKS.filter(
			(requiredHookType) => !hookTypes.includes(requiredHookType),
		);

		if (missingHooks.length) {
			throw new Error(
				`Adapter \`${
					adapter.meta.name
				}\` is missing hooks: \`${missingHooks.join("`, `")}\``,
			);
		}
	}

	async init(): Promise<void> {
		const [adapter, ...plugins] = await Promise.all(
			[
				this._project.config.adapter,
				...(this._project.config.plugins ?? []),
			].map((pluginRegistration) => this._loadPlugin(pluginRegistration)),
		);

		await Promise.all([
			this._setupPlugin(adapter, "adapter"),
			...plugins.map((plugin) => this._setupPlugin(plugin, "plugin")),
		]);

		this._validateAdapter(adapter);
	}
}

type CreateSliceMachinePluginRunnerArgs = {
	project: SliceMachineProject;
	nativePlugins?: Record<string, SliceMachinePlugin>;
};

/**
 * @internal
 */
export const createSliceMachinePluginRunner = ({
	project,
	nativePlugins,
}: CreateSliceMachinePluginRunnerArgs): SliceMachinePluginRunner => {
	const hookSystem = createSliceMachineHookSystem();

	return new SliceMachinePluginRunner({
		project,
		hookSystem,
		nativePlugins,
	});
};
