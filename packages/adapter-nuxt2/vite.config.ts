import { defineConfig, type Plugin } from "vite";
import sdk from "vite-plugin-sdk";

export default defineConfig({
	plugins: [
		sdk(),
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
			entry: {
				index: "./src/index.ts",
			},
		},
		rollupOptions: {
			external: ["vue"],
		},
	},
});
