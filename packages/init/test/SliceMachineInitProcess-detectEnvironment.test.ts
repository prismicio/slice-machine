import * as path from "node:path";

import { expect, it } from "vitest";

import { createSliceMachineInitProcess } from "../src";

import { watchStd } from "./__testutils__/watchStd";

const initProcess = createSliceMachineInitProcess({
	cwd: path.resolve(__dirname, "__fixtures__/base"),
});

it("detects framework and package manager", async () => {
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
