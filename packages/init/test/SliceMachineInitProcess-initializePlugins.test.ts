import { expect, it, vi, Mock } from "vitest";

import { SliceMachinePlugin } from "@slicemachine/plugin-kit";

import { createSliceMachineInitProcess, SliceMachineInitProcess } from "../src";
import { UNIVERSAL } from "../src/lib/framework";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { injectTestAdapter } from "./__testutils__/injectTestAdapter";
import { setContext } from "./__testutils__/setContext";
import { watchStd } from "./__testutils__/watchStd";

const initProcess = createSliceMachineInitProcess();

vi.mock("execa", async () => {
	const execa: typeof import("execa") = await vi.importActual("execa");

	return {
		...execa,
		execaCommand: ((command: string, options: Record<string, unknown>) => {
			// Replace `npm install`-like command with simple `echo`, we output
			// to stderr because regular logs are skipped when process is non-TTY
			return execa.execaCommand(
				`>&2 echo 'mock command ran: ${command}'`,
				options,
			);
		}) as typeof execa.execaCommand,
	};
});

const mockAdapter = async (
	initProcess: SliceMachineInitProcess,
	commandInitHookHandler: Mock,
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
			hook("command:init", commandInitHookHandler);
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
	const commandInitHookHandler = vi.fn();
	await mockAdapter(initProcess, commandInitHookHandler);

	await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.initializePlugins();
	});

	expect(commandInitHookHandler).toHaveBeenCalledOnce();
});

it("plugins can log things", async () => {
	const commandInitHookHandler = vi.fn().mockImplementation((args) => {
		// Supports strings...
		args.log("plugin string log");
		// ...and buffers
		args.log(Buffer.from("plugin buffer log", "utf-8"));
	});
	await mockAdapter(initProcess, commandInitHookHandler);

	const { stdout } = await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.initializePlugins();
	});

	expect(stdout).toMatch(/plugin string log/);
	expect(stdout).toMatch(/plugin buffer log/);
});

it("plugins can install additional dependencies", async () => {
	const commandInitHookHandler = vi.fn().mockImplementation(async (args) => {
		await args.installDependencies({ dependencies: { foo: "1.0.0" } });
	});
	await mockAdapter(initProcess, commandInitHookHandler);

	const { stdout } = await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.initializePlugins();
	});

	// Ran command
	expect(stdout).toMatch(/mock command ran/);
	// Command contains requested package
	expect(stdout).toMatch(/foo@1\.0\.0/);
});

it("plugins can install additional development dependencies", async () => {
	const commandInitHookHandler = vi.fn().mockImplementation(async (args) => {
		await args.installDependencies({
			dependencies: { foo: "1.0.0" },
			dev: true,
		});
	});
	await mockAdapter(initProcess, commandInitHookHandler);

	const { stdout } = await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.initializePlugins();
	});

	// Ran command
	expect(stdout).toMatch(/mock command ran/);
	// Command contains requested package
	expect(stdout).toMatch(/foo@1\.0\.0/);
	// Command contains dev flag
	expect(stdout).toMatch(/\-D/);
});

it("throws on dependency install error", async () => {
	const commandInitHookHandler = vi.fn().mockImplementation(async (args) => {
		// We make the process throw by providing parameters that cannot be turned into strings
		await args.installDependencies({
			dependencies: {
				foo: {
					toString() {
						throw new Error("dependency install error");
					},
				},
			},
		});
	});
	await mockAdapter(initProcess, commandInitHookHandler);

	try {
		await watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.initializePlugins();
		});
	} catch (error) {
		expect(error).toMatch(/Failed to initialize plugins/);
		expect(error).toMatchInlineSnapshot(
			"[Error: Failed to initialize plugins: Error: Error in `test-plugin-195b1754ad52b37bae18063a066d16ad1c706550` during `command:init` hook: dependency install error]",
		);
	}

	expect.assertions(2);
});

it("throws on dependency install execa error", async () => {
	const commandInitHookHandler = vi.fn().mockImplementation(async (args) => {
		// We make the process throw by providing parameters that cannot be turned into strings
		await args.installDependencies({
			dependencies: {
				foo: {
					toString() {
						class MockedExecaError extends Error {
							shortMessage: string;
							stderr: string;

							constructor(message: string) {
								super(message);
								this.shortMessage = message;
								this.stderr = "stderr";
							}
						}
						const error = new MockedExecaError("dependency install error");

						throw error;
					},
				},
			},
		});
	});
	await mockAdapter(initProcess, commandInitHookHandler);

	try {
		await watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.initializePlugins();
		});
	} catch (error) {
		expect(error).toMatch(/Failed to initialize plugins/);
		expect(error).toMatchInlineSnapshot(`
			[Error: Failed to initialize plugins: Error: Error in \`test-plugin-79e46e79e6ae2a98d180130ffb76b4aebe050ed3\` during \`command:init\` hook: 

			dependency install error
			stderr

			[31m✖[39m Plugins dependency installation failed]
		`);
	}

	expect.assertions(2);
});

it("throws if plugin init hook has errors", async () => {
	const commandInitHookHandler = vi.fn().mockImplementation(() => {
		throw new Error("plugin error");
	});
	await mockAdapter(initProcess, commandInitHookHandler);

	try {
		await watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.initializePlugins();
		});
	} catch (error) {
		expect(error).toMatch(/Failed to initialize plugins/);
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
