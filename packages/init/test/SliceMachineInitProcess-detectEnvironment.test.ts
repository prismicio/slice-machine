import { expect, it } from "vitest";
import { vol } from "memfs";

import { createSliceMachineInitProcess } from "../src";

import { watchStd } from "./__testutils__/watchStd";

it("detects framework and package manager", async () => {
	const initProcess = createSliceMachineInitProcess({ cwd: "/base" });
	vol.fromJSON(
		{
			"./package.json": JSON.stringify({
				name: "package-base",
				version: "0.0.0",
				dependencies: {
					next: "^13.0.0",
				},
			}),
			"./yarn.lock": "{}",
		},
		"/base",
	);

	// @ts-expect-error - Accessing protected property
	expect(initProcess.context).toMatchInlineSnapshot("{}");

	await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.detectEnvironment();
	});

	// @ts-expect-error - Accessing protected property
	expect(initProcess.context).toMatchInlineSnapshot(`
		{
		  "framework": {
		    "adapterName": "@slicemachine/adapter-next",
		    "compatibility": {
		      "next": "^11.0.0 || ^12.0.0 || ^13.0.0",
		    },
		    "devDependencies": {
		      "@slicemachine/adapter-next": "latest",
		      "slice-machine-ui": "<1.0.0",
		    },
		    "name": "Next.js 11-13",
		    "prismicName": "next-11-13",
		  },
		  "packageManager": "yarn",
		}
	`);
});

it("falls back to npm if package manager is not detected", async () => {
	const initProcess = createSliceMachineInitProcess({ cwd: "/base" });
	vol.fromJSON(
		{
			"./package.json": JSON.stringify({
				name: "package-base",
				version: "0.0.0",
			}),
		},
		"/base",
	);

	// @ts-expect-error - Accessing protected property
	expect(initProcess.context).toMatchInlineSnapshot("{}");

	await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.detectEnvironment();
	});

	// @ts-expect-error - Accessing protected property
	expect(initProcess.context).toMatchInlineSnapshot(`
		{
		  "framework": {
		    "adapterName": "@slicemachine/adapter-universal",
		    "compatibility": {},
		    "devDependencies": {
		      "@slicemachine/adapter-universal": "latest",
		      "slice-machine-ui": "<1.0.0",
		    },
		    "name": "universal (no framework)",
		    "prismicName": "universal",
		  },
		  "packageManager": "npm",
		}
	`);
});
