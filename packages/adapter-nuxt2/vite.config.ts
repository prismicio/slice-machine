import { defineConfig } from "vite";
import sdk from "vite-plugin-sdk";

export default defineConfig({
	plugins: [
		sdk({
			internalDependencies: ["fp-ts", "@prismicio/simulator"],
		}),
	],
	build: {
		lib: {
			entry: {
				index: "./src/index.ts",
				simulator: "./src/simulator/index.ts",
			},
		},
		rollupOptions: {
			external: ["vue"],
		},
	},
});
