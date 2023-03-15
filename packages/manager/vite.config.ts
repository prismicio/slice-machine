import { defineConfig } from "vite";
import sdk from "vite-plugin-sdk";
import renameNodeModules from "rollup-plugin-rename-node-modules";

export default defineConfig({
	plugins: [
		sdk({
			internalDependencies: [
				"execa",
				"fp-ts",
				"r19",
				"p-limit",
				"get-port",
				"node-fetch",
				"file-type",
			],
		}),
	],
	build: {
		lib: {
			entry: {
				index: "./src/index.ts",
				client: "./src/client/index.ts",
				test: "./src/test/index.ts",
			},
		},
		rollupOptions: {
			external: ["readable-web-to-node-stream"],
			plugins: [
				// @ts-expect-error - Type mismatch
				renameNodeModules("_node_modules"),
			],
		},
	},
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
