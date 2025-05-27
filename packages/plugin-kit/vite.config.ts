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
});
