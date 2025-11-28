import { defineConfig, type Plugin } from "vite";
import sdk from "vite-plugin-sdk";
import react from "@vitejs/plugin-react";
import preserveDirectives from "rollup-plugin-preserve-directives";

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
		react(),
	],
	build: {
		lib: {
			entry: {
				index: "./src/index.ts",
			},
		},
		rollupOptions: {
			plugins: [preserveDirectives() as Plugin],
		},
	},
});
