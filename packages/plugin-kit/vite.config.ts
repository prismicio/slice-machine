import { defineConfig } from "vite";
import sdk from "vite-plugin-sdk";

export default defineConfig({
	plugins: [
		sdk({
			internalDependencies: ["fp-ts", "p-limit"],
		}),
	],
	build: {
		lib: {
			entry: ["./src/index.ts", "./src/fs/index.ts"],
		},
	},
	test: {
		coverage: {
			provider: "v8",
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
