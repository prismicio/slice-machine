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
});
