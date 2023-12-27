import { expect, it, vi } from "vitest";
import { Analytics } from "@segment/analytics-node";

import { createPrismicAuthLoginResponse } from "./__testutils__/createPrismicAuthLoginResponse";
import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";
import { mockSliceMachineAPI } from "./__testutils__/mockSliceMachineAPI";

import { createSliceMachineManager, Environment } from "../src";

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
				environmentKind: undefined,
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

it("sends the environment kind when configured and authenticated", async (ctx) => {
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("project:environment:read", () => ({ environment: "bar" }));
			hook("project:environment:update", () => void 0);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	await manager.telemetry.initTelemetry({
		appName: "slice-machine-ui",
		appVersion: "0.0.1-test",
	});

	const shortId = "user-foo";

	mockPrismicUserAPI(ctx, {
		profileEndpoint: {
			profile: {
				shortId,
			},
		},
	});
	mockPrismicAuthAPI(ctx);

	const prismicAuthLoginResponse = createPrismicAuthLoginResponse();
	await manager.user.login(prismicAuthLoginResponse);

	const authenticationToken = await manager.user.getAuthenticationToken();

	const environments: Environment[] = [
		{
			kind: "prod",
			domain: "foo",
			name: "Foo",
			users: [{ id: shortId }],
		},
		{
			kind: "stage",
			domain: "bar",
			name: "Bar",
			users: [{ id: shortId }],
		},
		{
			kind: "dev",
			domain: "baz",
			name: "Baz",
			users: [{ id: shortId }],
		},
	];

	mockSliceMachineAPI(ctx, {
		environmentsV1Endpoint: {
			expectedAuthenticationToken: authenticationToken,
			expectedCookies: prismicAuthLoginResponse.cookies,
			environments,
		},
	});

	await manager.telemetry.track({
		event: "command:init:start",
		_includeEnvironmentKind: true,
	});

	expect(Analytics.prototype.track).toHaveBeenCalledWith(
		expect.objectContaining({
			properties: expect.objectContaining({
				environmentKind: "stage",
			}),
		}),
		expect.any(Function),
	);
});

it("sends an unknown environment kind when configured and the environment cannot be determined", async (ctx) => {
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("project:environment:read", () => ({ environment: "foo" }));
			hook("project:environment:update", () => void 0);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	await manager.telemetry.initTelemetry({
		appName: "slice-machine-ui",
		appVersion: "0.0.1-test",
	});

	const shortId = "user-foo";

	mockPrismicUserAPI(ctx, {
		profileEndpoint: {
			profile: {
				shortId,
			},
		},
	});
	mockPrismicAuthAPI(ctx);

	const prismicAuthLoginResponse = createPrismicAuthLoginResponse();
	await manager.user.login(prismicAuthLoginResponse);

	const authenticationToken = await manager.user.getAuthenticationToken();

	mockSliceMachineAPI(ctx, {
		environmentsV1Endpoint: {
			expectedAuthenticationToken: authenticationToken,
			expectedCookies: prismicAuthLoginResponse.cookies,
			environments: [],
		},
	});

	await manager.telemetry.track({
		event: "command:init:start",
		_includeEnvironmentKind: true,
	});

	expect(Analytics.prototype.track).toHaveBeenCalledWith(
		expect.objectContaining({
			properties: expect.objectContaining({
				environmentKind: "_unknown",
			}),
		}),
		expect.any(Function),
	);
});

it("sends the production environment kind when configured and the adapter does not support environments", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	await manager.telemetry.initTelemetry({
		appName: "slice-machine-ui",
		appVersion: "0.0.1-test",
	});

	await manager.telemetry.track({
		event: "command:init:start",
		_includeEnvironmentKind: true,
	});

	expect(Analytics.prototype.track).toHaveBeenCalledWith(
		expect.objectContaining({
			properties: expect.objectContaining({
				environmentKind: "prod",
			}),
		}),
		expect.any(Function),
	);
});

it("throws if telemetry was not initialized", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await expect(async () => {
		await manager.telemetry.track({
			event: "command:init:start",
		});
	}).rejects.toThrow(/telemetry has not been initialized/i);
});
