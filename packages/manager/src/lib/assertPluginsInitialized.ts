import { SliceMachinePluginRunner } from "@slicemachine/plugin-kit";

export function assertPluginsInitialized(
	pluginRunner: SliceMachinePluginRunner | undefined,
): asserts pluginRunner is NonNullable<typeof pluginRunner> {
	if (pluginRunner == undefined) {
		throw new Error(
			"Plugins have not been initialized. Run `SliceMachineManager.plugins.prototype.initPlugins()` before re-calling this method.",
		);
	}
}
