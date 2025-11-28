import { defineConfig, type Plugin } from "vite";
import sdk from "vite-plugin-sdk";

export default defineConfig({
	build: {
		lib: {
			entry: {
				index: "./src/index.ts",
				cli: "./src/cli.ts",
			},
		},
	},
	plugins: [
		sdk({
			internalDependencies: ["meow", "globby", "p-limit"],
		}),
		{
			name: "esm-only",
			configResolved(config) {
				if (config.build.lib) {
					config.build.lib.formats = ["es"];
				}
			},
		} as Plugin,
	],
});
