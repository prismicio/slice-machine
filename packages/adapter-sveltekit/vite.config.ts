import { defineConfig } from "vite";
import sdk from "vite-plugin-sdk";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
	plugins: [
		sdk({
			internalDependencies: ["fp-ts"],
		}),
		svelte({ hot: false }),
	],
	resolve: process.env.VITEST
		? {
				conditions: ["browser"],
		  }
		: undefined,
	test: {
		testTimeout: 15_000,
		coverage: {
			provider: "v8",
			reporter: ["lcovonly", "text"],
		},
		setupFiles: "./test/__setup__.ts",
	},
});
