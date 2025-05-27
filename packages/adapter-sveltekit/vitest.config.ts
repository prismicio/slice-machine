import { defineConfig, type UserConfig } from "vitest/config";
import sdk from "vite-plugin-sdk";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
	plugins: [
		sdk({
			internalDependencies: ["fp-ts"],
		}),
		svelte({ hot: false }),
	] as UserConfig["plugins"],
	test: {
		testTimeout: 15_000,
		coverage: {
			provider: "v8",
			reporter: ["lcovonly", "text"],
		},
		setupFiles: "./test/__setup__.ts",
		// deps: {
		// 	inline:
		// 		// TODO: Replace with true once https://github.com/vitest-dev/vitest/issues/2806 is fixed.
		// 		[/^(?!.*vitest).*$/],
		// },
	},
});
