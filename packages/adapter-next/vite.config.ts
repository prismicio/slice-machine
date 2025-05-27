import { defineConfig, Plugin } from "vite";
import sdk from "vite-plugin-sdk";
import react from "@vitejs/plugin-react";
import preserveDirectives from "rollup-plugin-preserve-directives";

export default defineConfig({
	plugins: [
		sdk({
			internalDependencies: ["fp-ts"],
		}),
		react(),
	],
	build: {
		lib: {
			entry: {
				index: "./src/index.ts",
				simulator: "./src/simulator/index.ts",
				"simulator/react-server": "./src/simulator/react-server/index.ts",
			},
		},
		rollupOptions: {
			plugins: [preserveDirectives() as Plugin],
		},
	},
});
