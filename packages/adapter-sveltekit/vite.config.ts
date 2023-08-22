import { defineConfig } from "vite";
import sdk from "vite-plugin-sdk";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
	plugins: [
		sdk({
			internalDependencies: ["fp-ts", "node-fetch"],
		}),
		svelte({ hot: false }),
	],
	test: {
		testTimeout: 15_000,
		coverage: {
			provider: "v8",
			reporter: ["lcovonly", "text"],
		},
		setupFiles: "./test/__setup__.ts",
		deps: {
			inline:
				// TODO: Replace with true once https://github.com/vitest-dev/vitest/issues/2806 is fixed.
				[/^(?!.*vitest).*$/],
		},
	},
});
