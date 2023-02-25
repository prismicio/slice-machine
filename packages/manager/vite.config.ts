import { defineConfig } from "vite";
import sdk from "vite-plugin-sdk";
import renameNodeModules from "rollup-plugin-rename-node-modules";

export default defineConfig({
	logLevel: "warn",
	plugins: [
		sdk({
			internalDependencies: [
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
			output: {
				exports: "named",
			},
			plugins: [
				// @ts-expect-error - Type mismatch
				renameNodeModules("_node_modules"),
			],
		},
	},
	test: {
		coverage: {
			reporter: ["lcovonly", "text"],
		},
		setupFiles: ["./test/__setup__.ts"],
		deps: {
			inline: true,
		},
	},
});
