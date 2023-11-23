import { expect, it, vi } from "vitest";
import { Analytics } from "@segment/analytics-node";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

vi.mock("@segment/analytics-node", () => {
	const MockSegmentClient = vi.fn();

	MockSegmentClient.prototype.track = vi.fn(
		(_message: unknown, callback?: (error?: unknown) => void) => {
			if (callback) {
				callback();
			}
		},
	);

	MockSegmentClient.prototype.on = vi.fn();

	return {
		Analytics: MockSegmentClient,
	};
});

it("sends a given event to Segment", async () => {
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

	await manager.telemetry.track({
		event: "command:init:start",
	});

	expect(Analytics.prototype.track).toHaveBeenCalledWith(
		{
			anonymousId: expect.any(String),
			event: "SliceMachine Init Start",
			properties: {
				repo: undefined,
				nodeVersion: process.versions.node,
			},
			context: {
				app: { name: "slice-machine-ui", version: "0.0.1-test" },
				groupId: {
					Repository: await manager.project.getRepositoryName(),
				},
			},
		},
		expect.any(Function),
	);
});

it("maps event payloads correctly to expected Segment tracking payloads", async () => {
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

	const commandInitEndProperties = {
		repository: "foo",
		framework: "bar",
		success: true,
	};

	await manager.telemetry.track({
		event: "command:init:end",
		...commandInitEndProperties,
	});

	expect(Analytics.prototype.track).toHaveBeenCalledOnce();
	expect(Analytics.prototype.track).toHaveBeenCalledWith(
		expect.objectContaining({
			event: "SliceMachine Init End",
			properties: {
				framework: commandInitEndProperties.framework,
				success: commandInitEndProperties.success,
				nodeVersion: process.versions.node,
			},
			context: {
				app: { name: "slice-machine-ui", version: "0.0.1-test" },
				groupId: { Repository: commandInitEndProperties.repository },
			},
		}),
		expect.any(Function),
	);

	const customTypeCreatedProperties = {
		id: "test",
		name: "testing",
		type: "repeatable" as const,
		format: "custom" as const,
		origin: "table" as const,
	};

	await manager.telemetry.track({
		event: "custom-type:created",
		...customTypeCreatedProperties,
	});

	expect(Analytics.prototype.track).toHaveBeenCalledTimes(2);
	expect(Analytics.prototype.track).toHaveBeenCalledWith(
		expect.objectContaining({
			event: "SliceMachine Custom Type Created",
			properties: {
				...customTypeCreatedProperties,
				nodeVersion: process.versions.node,
			},
			context: {
				app: { name: "slice-machine-ui", version: "0.0.1-test" },
				groupId: { Repository: await manager.project.getRepositoryName() },
			},
		}),
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

	vi.mocked(Analytics.prototype.track).mockImplementationOnce(
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

	await manager.telemetry.track({
		event: "command:init:start",
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
		await manager.telemetry.track({
			event: "command:init:start",
		});
	}).rejects.toThrow(/telemetry has not been initialized/i);
});
