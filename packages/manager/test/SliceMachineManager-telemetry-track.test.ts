import { expect, it, vi } from "vitest";
import SegmentClient from "analytics-node";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

vi.mock("analytics-node", () => {
	const MockSegmentClient = vi.fn();

	MockSegmentClient.prototype.track = vi.fn(
		(_message: unknown, callback: (error?: Error) => void) => {
			if (callback) {
				callback();
			}
		},
	);

	return {
		default: MockSegmentClient,
	};
});

it("sends a given event to Segment", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
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
		},
		expect.any(Function),
	);
});

it('supports the "SliceMachine Init Start" event via the `command:init:start` token', async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.telemetry.initTelemetry();

	await manager.telemetry.track({
		event: "command:init:start",
	});

	expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
		expect.objectContaining({
			event: "SliceMachine Init Start",
		}),
		expect.any(Function),
	);
});

it('supports the "SliceMachine Init Identify" event via the `command:init:identify` token', async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.telemetry.initTelemetry();

	await manager.telemetry.track({
		event: "command:init:identify",
	});

	expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
		expect.objectContaining({
			event: "SliceMachine Init Identify",
		}),
		expect.any(Function),
	);
});

it('supports the "SliceMachine Init End" event via the `command:init:end` token', async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.telemetry.initTelemetry();

	await manager.telemetry.track({
		event: "command:init:end",
		repository: "foo",
		framework: "bar",
		success: true,
	});

	expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
		expect.objectContaining({
			event: "SliceMachine Init End",
			properties: {
				repo: "foo",
				framework: "bar",
				success: true,
			},
		}),
		expect.any(Function),
	);
});

it('supports the "SliceMachine Review" event via the `review` token', async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.telemetry.initTelemetry();

	const properties = { comment: "comment", framework: "next", rating: 3 };

	await manager.telemetry.track({ event: "review", ...properties });

	expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
		expect.objectContaining({ event: "SliceMachine Review", properties }),
		expect.any(Function),
	);
});

it('supports the "SliceMachine Onboarding Start" event via the `onboarding:start` token', async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.telemetry.initTelemetry();

	await manager.telemetry.track({ event: "onboarding:start" });

	expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
		expect.objectContaining({ event: "SliceMachine Onboarding Start" }),
		expect.any(Function),
	);
});

it('supports the "SliceMachine Onboarding Skip" event via the `onboarding:skip` token', async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.telemetry.initTelemetry();

	const properties = { screenSkipped: 1 };

	await manager.telemetry.track({ event: "onboarding:skip", ...properties });

	expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
		expect.objectContaining({
			event: "SliceMachine Onboarding Skip",
			properties,
		}),
		expect.any(Function),
	);
});

it('supports the "SliceMachine Onboarding Continue Screen Intro" event via the `onboarding:continue:screen-intro` token', async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.telemetry.initTelemetry();

	await manager.telemetry.track({ event: "onboarding:continue:screen-intro" });

	expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
		expect.objectContaining({
			event: "SliceMachine Onboarding Continue Screen Intro",
		}),
		expect.any(Function),
	);
});

it('supports the "SliceMachine Onboarding Continue Screen 1" event via the `onboarding:continue:screen-1` token', async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.telemetry.initTelemetry();

	await manager.telemetry.track({ event: "onboarding:continue:screen-1" });

	expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
		expect.objectContaining({
			event: "SliceMachine Onboarding Continue Screen 1",
		}),
		expect.any(Function),
	);
});

it('supports the "SliceMachine Onboarding Continue Screen 2" event via the `onboarding:continue:screen-2` token', async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.telemetry.initTelemetry();

	await manager.telemetry.track({ event: "onboarding:continue:screen-2" });

	expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
		expect.objectContaining({
			event: "SliceMachine Onboarding Continue Screen 2",
		}),
		expect.any(Function),
	);
});

it('supports the "SliceMachine Onboarding Continue Screen 3" event via the `onboarding:continue:screen-3` token', async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.telemetry.initTelemetry();

	await manager.telemetry.track({ event: "onboarding:continue:screen-3" });

	expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
		expect.objectContaining({
			event: "SliceMachine Onboarding Continue Screen 3",
		}),
		expect.any(Function),
	);
});

it('supports the "SliceMachine Slice Simulator Setup" event via the `slice-simulator:setup` token', async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.telemetry.initTelemetry();

	const properties = { framework: "next", version: "0.2.0" };

	await manager.telemetry.track({
		event: "slice-simulator:setup",
		...properties,
	});

	expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
		expect.objectContaining({
			event: "SliceMachine Slice Simulator Setup",
			properties,
		}),
		expect.any(Function),
	);
});

it('supports the "SliceMachine Slice Simulator Open" event via the `slice-simulator:open` token', async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.telemetry.initTelemetry();

	const properties = { framework: "next", version: "0.2.0" };

	await manager.telemetry.track({
		event: "slice-simulator:open",
		...properties,
	});

	expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
		expect.objectContaining({
			event: "SliceMachine Slice Simulator Open",
			properties,
		}),
		expect.any(Function),
	);
});

it('supports the "SliceMachine Slice Simulator is not running" event via the `slice-simulator:is-not-running` token', async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.telemetry.initTelemetry();

	const properties = { framework: "next" };

	await manager.telemetry.track({
		event: "slice-simulator:is-not-running",
		...properties,
	});

	expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
		expect.objectContaining({
			event: "SliceMachine Slice Simulator is not running",
			properties,
		}),
		expect.any(Function),
	);
});

it('supports the "SliceMachine Page View" event via the `page-view` token', async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.telemetry.initTelemetry();

	const properties = {
		framework: "next",
		path: "/",
		referrer: "",
		search: "",
		slicemachineVersion: "0.2.0",
		title: "",
		url: "http://localhost:3000/",
	};

	await manager.telemetry.track({ event: "page-view", ...properties });

	expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
		expect.objectContaining({ event: "SliceMachine Page View", properties }),
		expect.any(Function),
	);
});

it('supports the "SliceMachine Open Video Tutorials" event via the `open-video-tutorials` token', async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.telemetry.initTelemetry();

	const properties = {
		framework: "next",
		slicemachineVersion: "0.2.0",
		video: "foo",
	};

	await manager.telemetry.track({
		event: "open-video-tutorials",
		...properties,
	});

	expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
		expect.objectContaining({
			event: "SliceMachine Open Video Tutorials",
			properties,
		}),
		expect.any(Function),
	);
});

it('supports the "SliceMachine Custom Type Created" event via the `custom-type:created` token', async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.telemetry.initTelemetry();

	const properties = {
		id: "test",
		name: "testing",
		type: "repeatable" as const,
	};

	await manager.telemetry.track({
		event: "custom-type:created",
		...properties,
	});

	expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
		expect.objectContaining({
			event: "SliceMachine Custom Type Created",
			properties,
		}),
		expect.any(Function),
	);
});

it('supports the "IdentifyUser" event via the `identify-user` token', async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.telemetry.initTelemetry();

	await manager.telemetry.track({ event: "identify-user" });

	expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
		expect.objectContaining({ event: "IdentifyUser" }),
		expect.any(Function),
	);
});

it('supports the "GroupLibraries" event via the `group-libraries` token', async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.telemetry.initTelemetry();

	const properties = {
		repoName: "wooooooooo",
		downloadedLibs: [],
		downloadedLibsCount: 0,
		manualLibsCount: 0,
		npmLibsCount: 0,
		slicemachineVersion: "0.2.0",
	};

	await manager.telemetry.track({ event: "group-libraries", ...properties });

	expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
		expect.objectContaining({ event: "GroupLibraries", properties }),
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
