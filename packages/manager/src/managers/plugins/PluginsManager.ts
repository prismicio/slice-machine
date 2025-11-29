import {
	createPluginSystemRunner,
	Plugin,
	PluginSystemRunner,
} from "@prismicio/plugin-kit";

import { assertPluginsInitialized } from "../../lib/assertPluginsInitialized";
import { BaseManager } from "../BaseManager";
import { PrismicManager } from "../PrismicManager";

type PluginsManagerConfig = {
	nativePlugins?: Record<string, Plugin>;
};

export class PluginsManager extends BaseManager {
	private _nativePlugins: Record<string, Plugin>;

	constructor(prismicManager: PrismicManager, config: PluginsManagerConfig) {
		super(prismicManager);

		this._nativePlugins = config.nativePlugins ?? {};
	}

	async initPlugins(): Promise<void> {
		const projectRoot = await this.project.getRoot();
		const prismicConfig = await this.project.getPrismicConfig();

		this.pluginSystemRunner = createPluginSystemRunner({
			project: {
				root: projectRoot,
				config: prismicConfig,
			},
			nativePlugins: this._nativePlugins,
		});

		await this.pluginSystemRunner.init();
	}

	dangerouslyCallHook: PluginSystemRunner["callHook"] = (...args) => {
		assertPluginsInitialized(this.pluginSystemRunner);

		return this.pluginSystemRunner.callHook(...args);
	};
}
