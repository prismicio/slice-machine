import { defineConfig } from "vite";
import sdk from "vite-plugin-sdk";

export default defineConfig({
	plugins: [
		sdk({
			internalDependencies: ["execa", "fp-ts", "get-port", "node-fetch"],
		}),
	],
	build: {
		lib: {
			entry: {
				index: "./src/index.ts",
			},
		},
	},
});
