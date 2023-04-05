import { defineConfig } from "vite";
import sdk from "vite-plugin-sdk";

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
				simulator: "./src/simulator/index.ts",
			},
		},
	},
	test: {
		testTimeout: 10000,
		coverage: {
			provider: "c8",
			reporter: ["lcovonly", "text"],
		},
		setupFiles: "./test/__setup__.ts",
		deps: {
			inline: true,
		},
	},
});
