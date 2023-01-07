import { defineConfig } from "vite";
import sdk from "vite-plugin-sdk";
import renameNodeModules from "rollup-plugin-rename-node-modules";

export default defineConfig({
	plugins: [
		sdk({
			internalDependencies: ["node-fetch"],
		}),
	],
	build: {
		lib: {
			entry: {
				index: "./src/index.ts",
				cli: "./src/cli.ts",
			},
		},
		rollupOptions: {
			plugins: [
				// @ts-expect-error - Type mismatch
				renameNodeModules("_node_modules"),
			],
		},
	},
});
