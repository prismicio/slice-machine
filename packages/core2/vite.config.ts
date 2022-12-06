import { defineConfig } from "vite";
import sdk from "vite-plugin-sdk";

export default defineConfig({
	plugins: [
		sdk({
			internalDependencies: [
				"fp-ts",
				"devalue",
				"p-limit",
				"get-port",
				"node-fetch",
				"formdata-node",
				"form-data-encoder",
				"hast-util-to-string",
				"@wooorm/starry-night",
			],
		}),
	],
	build: {
		lib: {
			entry: {
				index: "./src/index.ts",
				client: "./src/client.ts",
			},
		},
	},
	test: {
		coverage: {
			reporter: ["lcovonly", "text"],
		},
		setupFiles: ["./test/__setup__"],
	},
});
