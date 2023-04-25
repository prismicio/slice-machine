import { beforeEach, expect, it } from "vitest";
import { execaCommand } from "execa";

import { createSliceMachineInitProcess } from "../src";
import { UNIVERSAL } from "../src/lib/framework";
import pkg from "../package.json";

import { setContext } from "./__testutils__/setContext";
import { updateContext } from "./__testutils__/updateContext";
import { watchStd } from "./__testutils__/watchStd";
import { spyManager } from "./__testutils__/spyManager";

const initProcess = createSliceMachineInitProcess();
const spiedManager = spyManager(initProcess);

beforeEach(async () => {
	setContext(initProcess, {
		packageManager: "npm",
		framework: UNIVERSAL,
	});

	spiedManager.project.installDependencies.mockImplementation((args) => {
		const execaProcess = execaCommand(
			`echo 'mock command ran: ${JSON.stringify(args)}'`,
			{ encoding: "utf-8" },
		);

		return Promise.resolve({
			execaProcess,
		});
	});

	// @ts-expect-error - Accessing protected property
	await initProcess.manager.telemetry.initTelemetry({
		appName: pkg.name,
		appVersion: pkg.version,
	});
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
