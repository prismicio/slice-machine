import { beforeEach, describe, expect, it, vi } from "vitest";

import { createSliceMachineInitProcess } from "../src";
import { UNIVERSAL } from "../src/lib/framework";
import pkg from "../package.json";

import { setContext } from "./__testutils__/setContext";
import { updateContext } from "./__testutils__/updateContext";
import { spyManager } from "./__testutils__/spyManager";
import { watchStd } from "./__testutils__/watchStd";

const initProcess = createSliceMachineInitProcess();
const spiedManager = spyManager(initProcess);

// TODO: DT-2588: Fix CI fail init test on windows (process.exit)
describe.skipIf(process.env.WIN32)("beginCoreDependenciesInstallation", () => {
	beforeEach(async () => {
		setContext(initProcess, {
			packageManager: "npm",
			framework: UNIVERSAL,
		});

		// @ts-expect-error - Accessing protected property
		await initProcess.manager.telemetry.initTelemetry({
			appName: pkg.name,
			appVersion: pkg.version,
		});
	});

	it("begins core dependencies installation process", async () => {
		await watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.beginCoreDependenciesInstallation();
		});

		// @ts-expect-error - Accessing protected property
		expect(initProcess.context.installProcess).toBeTypeOf("object");

		// @ts-expect-error - Accessing protected property
		initProcess.context.installProcess?.kill(0);
	});

	it("catches early core dependencies installation process errors", async () => {
		await watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.beginCoreDependenciesInstallation();
		});

		// @ts-expect-error - Accessing protected property
		expect(initProcess.context.installProcess).toBeTypeOf("object");

		vi.stubGlobal("process", { ...process, exit: vi.fn() });

		const { stderr } = await watchStd(async () => {
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

	it("appends repository selection to error message when core dependencies installation process throws early", async () => {
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

		// @ts-expect-error - Accessing protected property
		expect(initProcess.context.installProcess).toBeTypeOf("object");

		vi.stubGlobal("process", { ...process, exit: vi.fn() });

		const { stderr } = await watchStd(async () => {
			// @ts-expect-error - Accessing protected property
			initProcess.context.installProcess?.kill(2);

			try {
				// @ts-expect-error - Accessing protected property
				await initProcess.context.installProcess;
			} catch {
				// Noop
			}

			// Wait 2 ticks for async catch handler to happen
			return new Promise((res) =>
				process.nextTick(() => process.nextTick(res)),
			);
		});

		expect(stderr[0]).toMatch(/--repository=new-repo/);
	});

	it("throws if context is missing package manager", async () => {
		updateContext(initProcess, {
			packageManager: undefined,
		});

		await expect(
			watchStd(() => {
				// @ts-expect-error - Accessing protected method
				return initProcess.beginCoreDependenciesInstallation();
			}),
		).rejects.toThrowErrorMatchingInlineSnapshot(
			'"Project package manager must be available through context to run `beginCoreDependenciesInstallation`"',
		);
	});

	it("throws if context is missing framework", async () => {
		updateContext(initProcess, {
			framework: undefined,
		});

		await expect(
			watchStd(() => {
				// @ts-expect-error - Accessing protected method
				return initProcess.beginCoreDependenciesInstallation();
			}),
		).rejects.toThrowErrorMatchingInlineSnapshot(
			'"Project framework must be available through context to run `beginCoreDependenciesInstallation`"',
		);
	});
});
