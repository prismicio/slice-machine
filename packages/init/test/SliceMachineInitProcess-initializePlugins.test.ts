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

it("if plugin init hook has errors it logs them and continues", async () => {
	const projectInitHookHandler = vi.fn().mockImplementation(() => {
		throw new Error("plugin error");
	});
	await mockAdapter(initProcess, projectInitHookHandler);

	const { stderr, stdout } = await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.initializePlugins();
	});

	expect(stdout).toMatch(/Failed to initialize project/);
	expect(stdout).toMatch(/plugin error/);
	expect(stderr.length).toBe(0);
});

it("if plugin runner is not started it should inform the user about the issue and continue", async () => {
	const initProcess = createSliceMachineInitProcess();

	const result = await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.initializePlugins();
	});

	expect(result).toMatchInlineSnapshot(`
		{
		  "stderr": [],
		  "stdout": [
		    "[15:41:12] Initializing adapter... [started]
		",
		    "[15:41:12] Initializing adapter... [failed]
		",
		    "[15:41:12] → Plugins have not been initialized. Run \`SliceMachineManager.plugins.prototype.initPlugins()\` before re-calling this method.
		",
		  ],
		}
	`);
});
