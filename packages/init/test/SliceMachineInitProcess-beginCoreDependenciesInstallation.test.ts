import * as path from "node:path";

import { beforeEach, expect, it, vi } from "vitest";

import { createSliceMachineInitProcess } from "../src";
import { UNIVERSAL } from "../src/lib/framework";

import { watchStd } from "./__testutils__/watchStd";

const initProcess = createSliceMachineInitProcess({
	cwd: path.resolve(__dirname, "__fixtures__/base"),
});

beforeEach(() => {
	// @ts-expect-error - Accessing protected property
	initProcess.context.packageManager = "npm";
	// @ts-expect-error - Accessing protected property
	initProcess.context.framework = UNIVERSAL;
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

	const trackErrorSpy = vi
		// @ts-expect-error - Accessing protected method
		.spyOn(initProcess, "trackError")
		.mockImplementation(vi.fn());

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
	});

	expect(trackErrorSpy).toHaveBeenCalledOnce();
	expect(process.exit).toHaveBeenCalledOnce();
	expect(stderr[0]).toMatch(/Dependency installation failed/);

	vi.restoreAllMocks();
});

it("throws if context is missing package manager", async () => {
	// @ts-expect-error - Accessing protected property
	delete initProcess.context.packageManager;

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
	// @ts-expect-error - Accessing protected property
	delete initProcess.context.framework;

	await expect(
		watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.beginCoreDependenciesInstallation();
		}),
	).rejects.toThrowErrorMatchingInlineSnapshot(
		'"Project framework must be available through context to run `beginCoreDependenciesInstallation`"',
	);
});
