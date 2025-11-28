import * as path from "node:path";
import _module, { createRequire } from "node:module";

import { defu } from "defu";

import { HookSystem } from "./lib/HookSystem";
import { createPluginSystemContext } from "./createPluginSystemContext";
import { LoadedPlugin, Plugin } from "./definePlugin";
import {
	PrismicConfigPluginRegistration,
	PluginHookExtraArgs,
	PluginHookTypes,
	PluginHooks,
	PrismicProject,
} from "./types";
import { createPluginHookSystem } from "./createPluginHookSystem";
import {
	createPluginSystemActions,
	PluginSystemActions,
} from "./createPluginSystemActions";
import {
	createPluginSystemHelpers,
	PluginSystemHelpers,
} from "./createPluginSystemHelpers";

/**
 * @internal
 */
export const REQUIRED_ADAPTER_HOOKS: PluginHookTypes[] = [
	"slice:create",
	"slice:read",
	"slice:rename",
	"slice:delete",
	"slice:update",
	"slice-library:read",
	"custom-type:create",
	"custom-type:read",
	"custom-type:rename",
	"custom-type:delete",
	"custom-type:update",
	"custom-type-library:read",
];
/**
 * @internal
 */
export const ADAPTER_ONLY_HOOKS: PluginHookTypes[] = [
	"slice:read",
	"slice-library:read",
	"custom-type:read",
	"custom-type-library:read",
];

type PluginSystemRunnerConstructorArgs = {
	project: PrismicProject;
	hookSystem: HookSystem<PluginHooks>;
	nativePlugins?: Record<string, Plugin>;
};

/**
 * @internal
 */
export class PluginSystemRunner {
	private _project: PrismicProject;
	private _hookSystem: HookSystem<PluginHooks>;
	private _nativePlugins: Record<string, Plugin>;

	/**
	 * Plugin System actions provided to hooks.
	 *
	 * IMPORTANT: Prefer creating your own abstraction over using `rawActions`
	 * directly to prevent code breakage if this internal API changes.
	 *
	 * @internal
	 */
	rawActions: PluginSystemActions;

	/**
	 * Plugin System helpers provided to hooks.
	 *
	 * IMPORTANT: Prefer creating your own abstraction over using `rawHelpers`
	 * directly to prevent code breakage if this internal API changes.
	 *
	 * @internal
	 */
	rawHelpers: PluginSystemHelpers;

	// Methods forwarded to the plugin runner's hook system.
	callHook: HookSystem<PluginHooks>["callHook"];
	hooksForOwner: HookSystem<PluginHooks>["hooksForOwner"];
	hooksForType: HookSystem<PluginHooks>["hooksForType"];
	createScope: HookSystem<PluginHooks>["createScope"];

	constructor({
		project,
		hookSystem,
		nativePlugins = {},
	}: PluginSystemRunnerConstructorArgs) {
		this._project = project;
		this._hookSystem = hookSystem;
		this._nativePlugins = nativePlugins;

		this.rawActions = createPluginSystemActions(
			this._project,
			this._hookSystem,
		);
		this.rawHelpers = createPluginSystemHelpers(this._project);

		this.callHook = this._hookSystem.callHook.bind(this._hookSystem);
		this.hooksForOwner = this._hookSystem.hooksForOwner.bind(this._hookSystem);
		this.hooksForType = this._hookSystem.hooksForType.bind(this._hookSystem);
		this.createScope = this._hookSystem.createScope.bind(this._hookSystem);
	}

	private async _loadPlugin(
		pluginRegistration: PrismicConfigPluginRegistration,
	): Promise<LoadedPlugin> {
		// Sanitize registration
		const { resolve, options = {} } =
			typeof pluginRegistration === "object" && "resolve" in pluginRegistration
				? pluginRegistration
				: { resolve: pluginRegistration };

		let plugin: Plugin | undefined = undefined;

		if (typeof resolve === "string") {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			try {
				const noop = path.resolve(this._project.root, "noop.js");

				let resolvedID = resolve;

				// Support Yarn PnP
				if (
					process.versions.pnp &&
					"findPnpApi" in _module &&
					typeof _module.findPnpApi === "function"
				) {
					const pnpApi = _module.findPnpApi(noop);
					if (pnpApi) {
						resolvedID = pnpApi.resolveRequest(resolve, noop);
					}
				}

				const raw = await createRequire(noop)(resolvedID);
				plugin = raw.default || raw;
			} catch (error) {
				// Only log in development, but not during tests when a native plugin matches.
				if (
					import.meta.env.DEV &&
					!(import.meta.env.TEST && resolve in this._nativePlugins)
				) {
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
		plugin: LoadedPlugin,
		as: "adapter" | "plugin",
	): Promise<void> {
		const context = createPluginSystemContext({
			actions: this.rawActions,
			helpers: this.rawHelpers,
			project: this._project,
			plugin,
		});
		const hookSystemScope = this._hookSystem.createScope<PluginHookExtraArgs>(
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

	private _validateAdapter(adapter: LoadedPlugin): void {
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

type CreatePluginSystemRunnerArgs = {
	project: PrismicProject;
	nativePlugins?: Record<string, Plugin>;
};

/**
 * @internal
 */
export const createPluginSystemRunner = ({
	project,
	nativePlugins,
}: CreatePluginSystemRunnerArgs): PluginSystemRunner => {
	const hookSystem = createPluginHookSystem();

	return new PluginSystemRunner({
		project,
		hookSystem,
		nativePlugins,
	});
};
