import { expect, it } from "vitest";
import { vol } from "memfs";

import { createSliceMachineInitProcess } from "../src";

import { watchStd } from "./__testutils__/watchStd";

it("detects framework, starter and package manager", async () => {
	const initProcess = createSliceMachineInitProcess({ cwd: "/base" });
	vol.fromJSON(
		{
			"./package.json": JSON.stringify({
				name: "nuxt-starter-prismic-multi-page",
				version: "0.0.0",
				dependencies: {
					next: "^13.0.0",
				},
			}),
			"./package-lock.json": "{}",
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
		      "next": "^11 || ^12 || ^13 || ^14 || ^15 || ^16.0.0-beta.0",
		    },
		    "devDependencies": {
		      "@slicemachine/adapter-next": "latest",
		      "slice-machine-ui": "latest",
		    },
		    "name": "Next.js",
		    "prismicDocumentation": "https://prismic.dev/init/next",
		    "sliceMachineTelemetryID": "next",
		    "wroomTelemetryID": "next",
		  },
		  "packageManager": "npm",
		  "starterId": "nuxt_multi_page",
		}
	`);
});

it("assumes unconventional tags match semver range when detecting framework", async () => {
	const initProcess = createSliceMachineInitProcess({ cwd: "/base" });
	vol.fromJSON(
		{
			"./package.json": JSON.stringify({
				name: "package-base",
				version: "0.0.0",
				dependencies: {
					next: "latest",
				},
			}),
			"./package-lock.json": "{}",
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
		      "next": "^11 || ^12 || ^13 || ^14 || ^15 || ^16.0.0-beta.0",
		    },
		    "devDependencies": {
		      "@slicemachine/adapter-next": "latest",
		      "slice-machine-ui": "latest",
		    },
		    "name": "Next.js",
		    "prismicDocumentation": "https://prismic.dev/init/next",
		    "sliceMachineTelemetryID": "next",
		    "wroomTelemetryID": "next",
		  },
		  "packageManager": "npm",
		  "starterId": undefined,
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
		      "slice-machine-ui": "latest",
		    },
		    "name": "universal (no framework)",
		    "prismicDocumentation": "https://prismic.dev/init/universal",
		    "sliceMachineTelemetryID": "universal",
		    "wroomTelemetryID": "other",
		  },
		  "packageManager": "npm",
		  "starterId": undefined,
		}
	`);
});

it("throws when package.json could not be read", async () => {
	const initProcess = createSliceMachineInitProcess({ cwd: "/base" });
	vol.fromJSON(
		{
			"./package.json": "",
			"./package-lock.json": "{}",
		},
		"/base",
	);

	// @ts-expect-error - Accessing protected property
	expect(initProcess.context).toMatchInlineSnapshot("{}");

	await expect(
		watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.detectEnvironment();
		}),
	).rejects.toMatch(/Failed to read project\'s `package\.json`/);
});
