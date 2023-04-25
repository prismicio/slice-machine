import {
	createSliceMachinePluginRunner,
	SliceMachinePlugin,
	SliceMachinePluginRunner,
} from "@slicemachine/plugin-kit";

import { assertPluginsInitialized } from "../../lib/assertPluginsInitialized";

import { BaseManager } from "../BaseManager";
import { SliceMachineManager } from "../SliceMachineManager";

type PluginsManagerConfig = {
	nativePlugins?: Record<string, SliceMachinePlugin>;
};

export class PluginsManager extends BaseManager {
	private _nativePlugins: Record<string, SliceMachinePlugin>;

	constructor(
		sliceMachineManager: SliceMachineManager,
		config: PluginsManagerConfig,
	) {
		super(sliceMachineManager);

		this._nativePlugins = config.nativePlugins ?? {};
	}

	async initPlugins(): Promise<void> {
		const projectRoot = await this.project.getRoot();
		const sliceMachineConfig = await this.project.getSliceMachineConfig();

		this.sliceMachinePluginRunner = createSliceMachinePluginRunner({
			project: {
				root: projectRoot,
				config: sliceMachineConfig,
			},
			nativePlugins: this._nativePlugins,
		});

		await this.sliceMachinePluginRunner.init();
	}

	dangerouslyCallHook: SliceMachinePluginRunner["callHook"] = (...args) => {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		return this.sliceMachinePluginRunner.callHook(...args);
	};
}
