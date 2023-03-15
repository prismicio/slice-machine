import { expect, it, vi, Mock } from "vitest";

import { SliceMachinePlugin } from "@slicemachine/plugin-kit";

import { createSliceMachineInitProcess, SliceMachineInitProcess } from "../src";
import { UNIVERSAL } from "../src/lib/framework";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { injectTestAdapter } from "./__testutils__/injectTestAdapter";
import { setContext } from "./__testutils__/setContext";
import { watchStd } from "./__testutils__/watchStd";

const initProcess = createSliceMachineInitProcess();

const mockAdapter = async (
	initProcess: SliceMachineInitProcess,
	projectInitHookHandler: Mock,
): Promise<{
	adapter: SliceMachinePlugin;
}> => {
	setContext(initProcess, {
		packageManager: "npm",
		framework: UNIVERSAL,
		repository: {
			domain: "repo-admin",
			exists: true,
		},
	});

	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("project:init", projectInitHookHandler);
		},
	});
	injectTestAdapter({ initProcess, adapter });

	await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.upsertSliceMachineConfigurationAndStartPluginRunner();
	});

	return {
		adapter,
	};
};

it("runs plugin init hook", async () => {
	const projectInitHookHandler = vi.fn();
	await mockAdapter(initProcess, projectInitHookHandler);

	await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.initializePlugins();
	});

	expect(projectInitHookHandler).toHaveBeenCalledOnce();
});

it("plugins can log things", async () => {
	const projectInitHookHandler = vi.fn().mockImplementation((args) => {
		// Supports strings...
		args.log("plugin string log");
		// ...and buffers
		args.log(Buffer.from("plugin buffer log", "utf-8"));
	});
	await mockAdapter(initProcess, projectInitHookHandler);

	const { stdout } = await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.initializePlugins();
	});

	expect(stdout).toMatch(/plugin string log/);
	expect(stdout).toMatch(/plugin buffer log/);
});

it("throws if plugin init hook has errors", async () => {
	const projectInitHookHandler = vi.fn().mockImplementation(() => {
		throw new Error("plugin error");
	});
	await mockAdapter(initProcess, projectInitHookHandler);

	try {
		await watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.initializePlugins();
		});
	} catch (error) {
		expect(error).toMatch(/Failed to initialize project/);
		expect(error).toMatch(/plugin error/);
	}

	expect.assertions(2);
});

it("throws if plugin runner is not started", async () => {
	const initProcess = createSliceMachineInitProcess();

	await expect(
		watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.initializePlugins();
		}),
	).rejects.toThrowErrorMatchingInlineSnapshot(
		'"Plugins have not been initialized. Run `SliceMachineManager.plugins.prototype.initPlugins()` before re-calling this method."',
	);
});
