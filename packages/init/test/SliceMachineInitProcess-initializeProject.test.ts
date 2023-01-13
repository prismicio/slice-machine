import { expect, it } from "vitest";
import { vol } from "memfs";

import { createSliceMachineInitProcess } from "../src";

import { watchStd } from "./__testutils__/watchStd";

const initProcess = createSliceMachineInitProcess({ cwd: "/base" });

it("patches package.json script", async () => {
	vol.fromJSON(
		{
			"./package.json": JSON.stringify({
				name: "package-base",
				version: "0.0.0",
				dependencies: {
					next: "^13.0.0",
				},
			}),
		},
		"/base",
	);

	await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.initializeProject();
	});

	await expect(vol.promises.readFile("/base/package.json", "utf-8")).resolves
		.toMatchInlineSnapshot(`
		"{
		  \\"name\\": \\"package-base\\",
		  \\"version\\": \\"0.0.0\\",
		  \\"dependencies\\": {
		    \\"next\\": \\"^13.0.0\\"
		  },
		  \\"scripts\\": {
		    \\"slicemachine\\": \\"start-slicemachine\\"
		  }
		}"
	`);
});

it("preserves package.json indentation preference", async () => {
	vol.fromJSON(
		{
			"./package.json": JSON.stringify(
				{
					name: "package-base",
					version: "0.0.0",
					dependencies: {
						next: "^13.0.0",
					},
				},
				null,
				"\t",
			),
		},
		"/base",
	);

	await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.initializeProject();
	});

	await expect(vol.promises.readFile("/base/package.json", "utf-8")).resolves
		.toMatchInlineSnapshot(`
		"{
			\\"name\\": \\"package-base\\",
			\\"version\\": \\"0.0.0\\",
			\\"dependencies\\": {
				\\"next\\": \\"^13.0.0\\"
			},
			\\"scripts\\": {
				\\"slicemachine\\": \\"start-slicemachine\\"
			}
		}"
	`);

	vol.reset();

	vol.fromJSON(
		{
			"./package.json": JSON.stringify(
				{
					name: "package-base",
					version: "0.0.0",
					dependencies: {
						next: "^13.0.0",
					},
				},
				null,
				"   ",
			),
		},
		"/base",
	);

	await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.initializeProject();
	});

	await expect(vol.promises.readFile("/base/package.json", "utf-8")).resolves
		.toMatchInlineSnapshot(`
		"{
		   \\"name\\": \\"package-base\\",
		   \\"version\\": \\"0.0.0\\",
		   \\"dependencies\\": {
		      \\"next\\": \\"^13.0.0\\"
		   },
		   \\"scripts\\": {
		      \\"slicemachine\\": \\"start-slicemachine\\"
		   }
		}"
	`);
});

it("does not patch script twice if it already exists", async () => {
	vol.fromJSON(
		{
			"./package.json": JSON.stringify({
				name: "package-base",
				version: "0.0.0",
				scripts: {
					slicemachine: "start-slicemachine --port=9999",
				},
				dependencies: {
					next: "^13.0.0",
				},
			}),
		},
		"/base",
	);

	const { stdout } = await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.initializeProject();
	});

	await expect(
		vol.promises.readFile("/base/package.json", "utf-8"),
	).resolves.toMatchInlineSnapshot(
		'"{\\"name\\":\\"package-base\\",\\"version\\":\\"0.0.0\\",\\"scripts\\":{\\"slicemachine\\":\\"start-slicemachine --port=9999\\"},\\"dependencies\\":{\\"next\\":\\"^13.0.0\\"}}"',
	);
	expect(stdout).not.toMatch(/Could not patch/);
});

it("warns that scripts could not be patched", async () => {
	vol.fromJSON(
		{
			"./package.json": JSON.stringify({
				name: "package-base",
				version: "0.0.0",
				scripts: {
					slicemachine: "another script",
				},
				dependencies: {
					next: "^13.0.0",
				},
			}),
		},
		"/base",
	);

	const { stdout } = await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.initializeProject();
	});

	await expect(
		vol.promises.readFile("/base/package.json", "utf-8"),
	).resolves.toMatchInlineSnapshot(
		'"{\\"name\\":\\"package-base\\",\\"version\\":\\"0.0.0\\",\\"scripts\\":{\\"slicemachine\\":\\"another script\\"},\\"dependencies\\":{\\"next\\":\\"^13.0.0\\"}}"',
	);
	expect(stdout).toMatch(/Could not patch/);
});
