import { defineConfig } from "vite";
import sdk from "vite-plugin-sdk";

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
		},
	},
});
