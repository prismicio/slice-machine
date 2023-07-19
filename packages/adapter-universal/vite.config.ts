import { defineConfig } from "vite";
import sdk from "vite-plugin-sdk";

export default defineConfig({
	plugins: [
		sdk({
			internalDependencies: ["fp-ts", "node-fetch"],
		}),
	],
	build: {
		rollupOptions: {
			output: {
				exports: "named",
			},
		},
	},
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
