import { expect, it, vi } from "vitest";
import SegmentClient from "analytics-node";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockSliceMachineUIDirectory } from "./__testutils__/mockSliceMachineUIDirectory";

import { createSliceMachineManager } from "../src";

vi.mock("analytics-node", () => {
	const MockSegmentClient = vi.fn();

	MockSegmentClient.prototype.track = vi.fn(
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

it("sends a given event to Segment", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});
	await mockSliceMachineUIDirectory({
		ctx,
		packageJSON: { name: "slice-machine-ui", version: "0.2.0" },
	});

	await manager.telemetry.initTelemetry();

	await manager.telemetry.track({
		event: "command:init:start",
	});

	expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
		{
			anonymousId: expect.any(String),
			event: "SliceMachine Init Start",
			properties: {
				repo: undefined,
			},
			context: { app: { name: "slice-machine-ui", version: "0.2.0" } },
		},
		expect.any(Function),
	);
});

it("maps event payloads correctly to expected Segment tracking payloads", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});
	await mockSliceMachineUIDirectory({
		ctx,
		packageJSON: { name: "slice-machine-ui", version: "0.2.0" },
	});

	await manager.telemetry.initTelemetry();

	const commandInitEndProperties = {
		repository: "foo",
		framework: "bar",
		success: true,
	};

	await manager.telemetry.track({
		event: "command:init:end",
		...commandInitEndProperties,
	});

	expect(SegmentClient.prototype.track).toHaveBeenCalledOnce();
	expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
		expect.objectContaining({
			event: "SliceMachine Init End",
			properties: {
				repo: commandInitEndProperties.repository,
				framework: commandInitEndProperties.framework,
				success: commandInitEndProperties.success,
			},
			context: {
				app: { name: "slice-machine-ui", version: "0.2.0" },
				groupId: { Repository: commandInitEndProperties.repository },
			},
		}),
		expect.any(Function),
	);

	const customTypeCreatedProperties = {
		id: "test",
		name: "testing",
		type: "repeatable" as const,
	};

	await manager.telemetry.track({
		event: "custom-type:created",
		...customTypeCreatedProperties,
	});

	expect(SegmentClient.prototype.track).toHaveBeenCalledTimes(2);
	expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
		expect.objectContaining({
			event: "SliceMachine Custom Type Created",
			properties: customTypeCreatedProperties,
			context: { app: { name: "slice-machine-ui", version: "0.2.0" } },
		}),
		expect.any(Function),
	);
});

it("logs a warning to the console if Segment returns an error", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});
	await mockSliceMachineUIDirectory({
		ctx,
		packageJSON: { name: "slice-machine-ui", version: "0.2.0" },
	});

	await manager.telemetry.initTelemetry();

	vi.mocked(SegmentClient.prototype.track).mockImplementationOnce(
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
