import { defineConfig } from "vite";
import sdk from "vite-plugin-sdk";

export default defineConfig({
	build: {
		lib: {
			entry: ["./src/index.ts", "./src/cli.ts"],
		},
	},
	plugins: [sdk()],
});
