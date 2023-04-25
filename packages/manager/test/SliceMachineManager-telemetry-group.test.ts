import { expect, it, vi } from "vitest";
import SegmentClient from "analytics-node";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

vi.mock("analytics-node", () => {
	const MockSegmentClient = vi.fn();

	MockSegmentClient.prototype.group = vi.fn(
		(_message: unknown, callback?: (error?: Error) => void) => {
			if (callback) {
				callback();
			}
		},
	);

	return {
		default: MockSegmentClient,
	};
});

it("sends a group payload to Segment", async () => {
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

	await manager.telemetry.group({
		repositoryName: "repositoryName",
		downloadedLibs: [],
		downloadedLibsCount: 0,
		manualLibsCount: 0,
		npmLibsCount: 0,
	});

	expect(SegmentClient.prototype.group).toHaveBeenCalledWith(
		{
			anonymousId: expect.any(String),
			groupId: "repositoryName",
			traits: {
				downloadedLibs: [],
				downloadedLibsCount: 0,
				manualLibsCount: 0,
				npmLibsCount: 0,
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

	vi.mocked(SegmentClient.prototype.group).mockImplementationOnce(
		(_message, callback) => {
			if (callback) {
				callback(new Error());
			}

			return this as unknown as SegmentClient;
		},
	);

	const consoleWarnSpy = vi
		.spyOn(globalThis.console, "warn")
		.mockImplementation(() => void 0);

	await manager.telemetry.group({
		repositoryName: "repositoryName",
		downloadedLibs: [],
		downloadedLibsCount: 0,
		manualLibsCount: 0,
		npmLibsCount: 0,
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
		await manager.telemetry.group({
			repositoryName: "repositoryName",
			downloadedLibs: [],
			downloadedLibsCount: 0,
			manualLibsCount: 0,
			npmLibsCount: 0,
		});
	}).rejects.toThrow(/telemetry has not been initialized/i);
});
