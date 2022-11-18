import { SliceMachinePluginRunner } from "@slicemachine/plugin-kit";

export function assertPluginsInitialized(
	pluginRunner: SliceMachinePluginRunner | undefined,
): asserts pluginRunner is NonNullable<typeof pluginRunner> {
	if (pluginRunner == undefined) {
		throw new Error(
			"Plugins have not yet been initialized. Run `SliceMachineManager.prototype.initPlugins()` before re-calling this method.",
		);
	}
}
