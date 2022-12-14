import {
	createSliceMachinePluginRunner,
	SliceMachinePluginRunner,
} from "@slicemachine/plugin-kit";

import { assertPluginsInitialized } from "../../lib/assertPluginsInitialized";
import { BaseManager } from "../BaseManager";

export class PluginsManager extends BaseManager {
	async initPlugins(): Promise<void> {
		const projectRoot = await this.project.getRoot();
		const sliceMachineConfig = await this.project.getSliceMachineConfig();

		this.sliceMachinePluginRunner = createSliceMachinePluginRunner({
			project: {
				root: projectRoot,
				config: sliceMachineConfig,
			},
		});

		await this.sliceMachinePluginRunner.init();
	}

	dangerouslyCallHook: SliceMachinePluginRunner["callHook"] = (...args) => {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		return this.sliceMachinePluginRunner.callHook(...args);
	};
}
