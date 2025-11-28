import { defineConfig, type Plugin } from "vite";
import sdk from "vite-plugin-sdk";

export default defineConfig({
	plugins: [
		sdk({
			internalDependencies: ["p-limit"],
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
	build: {
		lib: {
			entry: ["./src/index.ts", "./src/fs/index.ts"],
		},
	},
});
