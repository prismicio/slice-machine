import { expect, it } from "vitest";

import { createPrismicAuthLoginResponse } from "./__testutils__/createPrismicAuthLoginResponse";
import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";
import { mockSliceMachineAPI } from "./__testutils__/mockSliceMachineAPI";

import {
	createSliceMachineManager,
	Environment,
	InvalidActiveEnvironmentError,
} from "../src";

it("returns the active environment", async (ctx) => {
	const shortId = "user-foo";
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
	];

	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("project:environment:read", () => ({
				environment: environments[1].domain,
			}));
			hook("project:environment:update", () => void 0);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

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
			environments,
		},
	});

	const res = await manager.project.fetchActiveEnvironment();

	expect(res).toStrictEqual({
		activeEnvironment: environments[1],
	});
});

it("returns SMInvalidSelectedEnvironmentError if the active environment is invalid", async (ctx) => {
	const shortId = "user-foo";
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
			users: [{ id: "id" }],
		},
	];

	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("project:environment:read", () => ({
				environment: environments[1].domain,
			}));
			hook("project:environment:update", () => void 0);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

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
			environments,
		},
	});

	const res = await manager.project.fetchActiveEnvironment();

	expect(res).toStrictEqual({
		activeEnvironment: undefined,
		error: expect.any(InvalidActiveEnvironmentError),
	});
});
