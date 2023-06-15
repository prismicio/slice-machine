import { defineConfig, Plugin } from "vite";
import sdk from "vite-plugin-sdk";
import react from "@vitejs/plugin-react";
import preserveDirectives from "rollup-plugin-preserve-directives";

export default defineConfig({
	plugins: [
		sdk({
			internalDependencies: ["node-fetch"],
		}),
		react(),
	],
	build: {
		lib: {
			entry: {
				index: "./src/index.ts",
				simulator: "./src/simulator/index.ts",
			},
		},
		rollupOptions: {
			plugins: [
				// @ts-expect-error - rollup-plugin-preserve-directives has a bundling issue when used in an ESM environment.
				// See: https://github.com/Ephem/rollup-plugin-preserve-directives/issues/1
				preserveDirectives.default() as Plugin,
			],
		},
	},
	test: {
		testTimeout: 10000,
		coverage: {
			provider: "v8",
			reporter: ["lcovonly", "text"],
		},
		setupFiles: "./test/__setup__.ts",
		deps: {
			inline: ["vuetify"],
		},
	},
});
