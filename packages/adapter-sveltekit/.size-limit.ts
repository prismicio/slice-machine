import type { SizeLimitConfig } from "size-limit";

import { exports } from "./package.json";

module.exports = [
	{
		name: "@slicemachine/adapter-sveltekit",
		path: exports["."].default,
		modifyEsbuildConfig,
	},
	{
		name: "@slicemachine/adapter-sveltekit/simulator",
		path: exports["./simulator"].default,
		modifyEsbuildConfig,
	},
] satisfies SizeLimitConfig;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function modifyEsbuildConfig(config: any) {
	config.platform = "node";

	// Add basic `*.svelte` support.
	config.loader = {
		...config.loader,
		".svelte": "text",
	};

	return config;
}
