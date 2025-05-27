import { defineConfig } from "vitest/config";

export default defineConfig({
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
