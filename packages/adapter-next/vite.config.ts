import { defineConfig } from "vite";
import sdk from "vite-plugin-sdk";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [
		sdk({
			internalDependencies: ["node-fetch"],
		}),
		react(),
	],
	build: {
		lib: {
			entry: {
				index: "./src/index.ts",
				simulator: "./src/simulator/index.ts",
			},
		},
	},
	test: {
		coverage: {
			provider: "c8",
			reporter: ["lcovonly", "text"],
		},
		setupFiles: "./test/__setup__.ts",
		deps: {
			inline: true,
		},
	},
});
