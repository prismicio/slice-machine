import { expect, it, vi } from "vitest";
import { Analytics } from "@segment/analytics-node";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

it("sends an identification payload to Segment", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.telemetry.initTelemetry({
		appName: "slice-machine-ui",
		appVersion: "0.0.1-test",
	});

	await manager.telemetry.identify({
		userID: "foo",
		intercomHash: "bar",
	});

	expect(Analytics.prototype.identify).toHaveBeenCalledWith(
		{
			userId: "foo",
			anonymousId: expect.any(String),
			integrations: {
				Intercom: {
					user_hash: "bar",
				},
			},
			context: { app: { name: "slice-machine-ui", version: "0.0.1-test" } },
		},
		expect.any(Function),
	);
});

it("logs a warning to the console if Segment returns an error", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.telemetry.initTelemetry({
		appName: "slice-machine-ui",
		appVersion: "0.0.1-test",
	});

	vi.mocked(Analytics.prototype.identify).mockImplementationOnce(
		(_message, callback) => {
			if (callback) {
				callback(new Error());
			}

			return this as unknown as Analytics;
		},
	);

	const consoleWarnSpy = vi
		.spyOn(globalThis.console, "warn")
		.mockImplementation(() => void 0);

	await manager.telemetry.identify({
		userID: "foo",
		intercomHash: "bar",
	});

	expect(consoleWarnSpy).toHaveBeenCalledWith(
		expect.stringMatching(/an error occurred/i),
		expect.any(Error),
	);

	consoleWarnSpy.mockRestore();
});

it("throws if telemetry was not initialized", async () => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	await expect(async () => {
		await manager.telemetry.identify({
			userID: "foo",
			intercomHash: "bar",
		});
	}).rejects.toThrow(/telemetry has not been initialized/i);
});
