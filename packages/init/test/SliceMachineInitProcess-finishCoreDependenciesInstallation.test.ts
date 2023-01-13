import { beforeEach, expect, it, vi } from "vitest";

import { createSliceMachineInitProcess } from "../src";
import { UNIVERSAL } from "../src/lib/framework";

import { setContext } from "./__testutils__/setContext";
import { updateContext } from "./__testutils__/updateContext";
import { spyManager } from "./__testutils__/spyManager";
import { watchStd } from "./__testutils__/watchStd";

vi.mock("execa", async () => {
	const execa: typeof import("execa") = await vi.importActual("execa");

	return {
		...execa,
		execaCommand: ((command: string, options: Record<string, unknown>) => {
			// Replace command with simple `echo`
			return execa.execaCommand(`echo 'mock command ran: ${command}'`, options);
		}) as typeof execa.execaCommand,
	};
});

const initProcess = createSliceMachineInitProcess();
const spiedManager = spyManager(initProcess);

beforeEach(async () => {
	setContext(initProcess, {
		packageManager: "npm",
		framework: UNIVERSAL,
	});

	// @ts-expect-error - Accessing protected property
	await initProcess.manager.telemetry.initTelemetry();
});

it("finishes core dependencies installation process", async () => {
	await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.beginCoreDependenciesInstallation();
	});

	const { stdout } = await watchStd(async () => {
		// @ts-expect-error - Accessing protected method
		return initProcess.finishCoreDependenciesInstallation();
	});

	expect(stdout.join("\n")).toMatch(/mock command ran/);
	expect(stdout.join("\n")).toMatch(/Installed core dependencies/);
});

it("catches core dependencies installation process errors", async () => {
	await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.beginCoreDependenciesInstallation();
	});

	vi.stubGlobal("process", { ...process, exit: vi.fn() });

	const { stderr } = await watchStd(async () => {
		// @ts-expect-error - Accessing protected method
		initProcess.finishCoreDependenciesInstallation();

		// @ts-expect-error - Accessing protected property
		initProcess.context.installProcess?.kill(2);

		try {
			// @ts-expect-error - Accessing protected property
			await initProcess.context.installProcess;
		} catch {
			// Noop
		}

		// Wait 2 ticks for async catch handler to happen
		await new Promise((res) => process.nextTick(res));
		await new Promise((res) => process.nextTick(res));
	});

	expect(spiedManager.telemetry.track).toHaveBeenCalledOnce();
	expect(spiedManager.telemetry.track).toHaveBeenNthCalledWith(
		1,
		expect.objectContaining({
			event: "command:init:end",
			framework: expect.any(String),
			success: false,
			error: expect.any(String),
		}),
	);
	expect(process.exit).toHaveBeenCalledOnce();
	expect(stderr[0]).toMatch(/Dependency installation failed/);
});

it("appends repository selection to error message when core dependencies installation process throws", async () => {
	updateContext(initProcess, {
		repository: {
			domain: "new-repo",
			exists: false,
		},
	});

	await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.beginCoreDependenciesInstallation();
	});

	vi.stubGlobal("process", { ...process, exit: vi.fn() });

	const { stderr } = await watchStd(async () => {
		// @ts-expect-error - Accessing protected method
		initProcess.finishCoreDependenciesInstallation();

		// @ts-expect-error - Accessing protected property
		initProcess.context.installProcess?.kill(2);

		try {
			// @ts-expect-error - Accessing protected property
			await initProcess.context.installProcess;
		} catch {
			// Noop
		}

		// Wait 3 ticks for async catch handler to happen
		await new Promise((res) => process.nextTick(res));
		await new Promise((res) => process.nextTick(res));
		await new Promise((res) => process.nextTick(res));
		await new Promise((res) => setTimeout(res, 50));
	});

	expect(stderr[0]).toMatch(/--repository=new-repo/);
});

it("throws if context is missing installation process", async () => {
	updateContext(initProcess, {
		installProcess: undefined,
	});

	await expect(
		watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.finishCoreDependenciesInstallation();
		}),
	).rejects.toThrowErrorMatchingInlineSnapshot(
		'"Initial dependencies installation process must be available through context to run `finishCoreDependenciesInstallation`"',
	);
});
