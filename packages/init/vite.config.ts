import { defineConfig } from "vite";
import sdk from "vite-plugin-sdk";
import renameNodeModules from "rollup-plugin-rename-node-modules";

export default defineConfig({
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
	plugins: [
		sdk({
			internalDependencies: ["execa", "meow", "globby"],
		}),
	],
	test: {
		testTimeout: 20000,
		coverage: {
			reporter: ["lcovonly", "text"],
		},
		setupFiles: ["./test/__setup__.ts"],
		deps: {
			inline: true,
		},
	},
});
