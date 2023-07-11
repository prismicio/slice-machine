import { defineConfig } from "vite";
import sdk from "vite-plugin-sdk";

export default defineConfig({
	plugins: [
		sdk({
			internalDependencies: ["fp-ts", "node-fetch"],
		}),
	],
	build: {
		lib: {
			entry: {
				index: "./src/index.ts",
				cli: "./src/cli.ts",
				"bin/start-slicemachine": "./src/bin/start-slicemachine.ts",
			},
		},
		rollupOptions: {
			// Listing `nodemon` as external prevents it from being
			// bundled. Note that `nodemon` is listed under
			// devDependencies and is used in
			// `./src/bin/start-slicemachine.ts`, which would
			// normally prompt Vite to bundle the dependency.
			external: ["nodemon"],
		},
	},
});
