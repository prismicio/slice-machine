import { defineConfig } from "vite";
import sdk from "vite-plugin-sdk";

export default defineConfig({
	build: {
		lib: {
			entry: {
				index: "./src/index.ts",
				cli: "./src/cli.ts",
			},
		},
	},
	plugins: [
		sdk({
			internalDependencies: ["meow", "globby"],
		}),
	],
	test: {
		testTimeout: 15_000,
		coverage: {
			reporter: ["lcovonly", "text"],
		},
		setupFiles: ["./test/__setup__.ts"],
		deps: {
			inline:
				// TODO: Replace with true once https://github.com/vitest-dev/vitest/issues/2806 is fixed.
				[/^(?!.*vitest).*$/],
		},
	},
});
