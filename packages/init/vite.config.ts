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
			internalDependencies: ["execa", "meow", "globby"],
		}),
	],
	test: {
		coverage: {
			reporter: ["lcovonly", "text"],
		},
		setupFiles: ["./test/__setup__.ts"],
		deps: {
			inline: true,
		},
	},
});
