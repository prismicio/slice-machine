import { PluginSystemRunner } from "@prismicio/plugin-kit";

export function assertPluginsInitialized(
	pluginSystemRunner: PluginSystemRunner | undefined,
): asserts pluginSystemRunner is NonNullable<typeof pluginSystemRunner> {
	if (pluginSystemRunner == undefined) {
		throw new Error(
			"Plugins have not been initialized. Run `PrismicManager.plugins.prototype.initPlugins()` before re-calling this method.",
		);
	}
}
