import { beforeEach, expect, it } from "vitest";
import { vol } from "memfs";

import { createSliceMachineInitProcess } from "../src";
import { UNIVERSAL } from "../src/lib/framework";

import { injectTestAdapter } from "./__testutils__/injectTestAdapter";
import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { setContext } from "./__testutils__/setContext";
import { updateContext } from "./__testutils__/updateContext";
import { watchStd } from "./__testutils__/watchStd";

const initProcess = createSliceMachineInitProcess();

beforeEach(async () => {
	setContext(initProcess, {
		packageManager: "npm",
		framework: UNIVERSAL,
		repository: {
			domain: "repo-admin",
			exists: true,
		},
	});
});

it("creates new Slice Machine configuration", async () => {
	const adapter = createTestPlugin();
	injectTestAdapter({ initProcess, adapter });

	const { stdout } = await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.upsertSliceMachineConfigurationAndStartPluginRunner();
	});

	expect(vol.toJSON()["/slicemachine.config.json"]).toMatchInlineSnapshot(`
		"{
		  \\"repositoryName\\": \\"repo-admin\\",
		  \\"adapter\\": \\"test-plugin-7fcf4ed34a26d3f3e72c0035521cad79705ff215\\",
		  \\"libraries\\": [\\"./slices\\"]
		}
		"
	`);
	expect(stdout).toMatch(/Created Slice Machine configuration/);
});

it("updates existing Slice Machine configuration", async () => {
	const adapter = createTestPlugin();
	injectTestAdapter({ initProcess, adapter });

	const existingConfig = {
		repositoryName: "previous-repo",
		adapter: "foo",
		libraries: ["./my-slices"],
	};
	await vol.promises.writeFile(
		"/slicemachine.config.json",
		JSON.stringify(existingConfig),
	);

	expect(
		JSON.parse(vol.toJSON()["/slicemachine.config.json"] || ""),
	).toStrictEqual(existingConfig);

	const { stdout } = await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.upsertSliceMachineConfigurationAndStartPluginRunner();
	});

	expect(vol.toJSON()["/slicemachine.config.json"]).toMatchInlineSnapshot(`
		"{
		  \\"repositoryName\\": \\"repo-admin\\",
		  \\"adapter\\": \\"test-plugin-2c924b07a7188bdb084a6bd464c8701d66349123\\",
		  \\"libraries\\": [\\"./my-slices\\"]
		}
		"
	`);
	expect(stdout).toMatch(/Updated Slice Machine configuration/);
});

it("starts plugin runner", async () => {
	const adapter = createTestPlugin();
	injectTestAdapter({ initProcess, adapter });

	const { stdout } = await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.upsertSliceMachineConfigurationAndStartPluginRunner();
	});

	const sliceMachinePluginRunner =
		// @ts-expect-error - Accessing protected property
		initProcess.manager.getSliceMachinePluginRunner();
	const registeredHooksForAdapter = sliceMachinePluginRunner?.hooksForOwner(
		adapter.meta.name,
	);

	expect(registeredHooksForAdapter).toContainEqual(
		expect.objectContaining({
			meta: expect.objectContaining({
				owner: adapter.meta.name,
			}),
		}),
	);
	// TODO: Revert when plugin are introduced to users
	// expect(stdout).toMatch(/Started plugin runner/);
	expect(stdout).toMatch(/Loaded adapter/);
});

it("throws if context is missing framework", async () => {
	updateContext(initProcess, {
		framework: undefined,
	});

	await expect(
		watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.upsertSliceMachineConfigurationAndStartPluginRunner();
		}),
	).rejects.toThrowErrorMatchingInlineSnapshot(
		'"Project framework must be available through context to run `upsertSliceMachineConfiguration`"',
	);
});

it("throws if context is missing repository", async () => {
	updateContext(initProcess, {
		repository: undefined,
	});

	await expect(
		watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.upsertSliceMachineConfigurationAndStartPluginRunner();
		}),
	).rejects.toThrowErrorMatchingInlineSnapshot(
		'"Repository selection must be available through context to run `upsertSliceMachineConfiguration`"',
	);
});
