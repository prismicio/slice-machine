import { defineConfig, type Plugin } from "vite";
import sdk from "vite-plugin-sdk";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
	plugins: [
		sdk({
			internalDependencies: ["fp-ts"],
		}),
		{
			name: "esm-only",
			configResolved(config) {
				if (config.build.lib) {
					config.build.lib.formats = ["es"];
				}
			},
		} as Plugin,
		svelte({ hot: false }),
	],
	build: {
		lib: {
			entry: "./src/index.ts",
		},
	},
});
