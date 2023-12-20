import { expect, it } from "vitest";
import { rest } from "msw";

import { createPrismicAuthLoginResponse } from "./__testutils__/createPrismicAuthLoginResponse";
import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";
import { mockSliceMachineAPI } from "./__testutils__/mockSliceMachineAPI";

import {
	createSliceMachineManager,
	Environment,
	UnauthenticatedError,
	UnauthorizedError,
} from "../src";

it("returns a list of environments for the Prismic repository", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
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
	const repositoryName = await manager.project.getRepositoryName();

	const environments: Environment[] = [
		{
			kind: "prod",
			domain: repositoryName,
			name: repositoryName,
			users: [{ id: shortId }],
		},
		{
			kind: "stage",
			domain: `${repositoryName}-foo`,
			name: "foo",
			users: [{ id: shortId }],
		},
		{
			kind: "dev",
			domain: `${repositoryName}-bar`,
			name: "bar",
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

	const res = await manager.prismicRepository.fetchEnvironments();

	expect(res).toStrictEqual({
		environments: environments.filter((environment) => {
			if (environment.kind === "dev") {
				return environment.users.some((user) => user.id === shortId);
			}

			return true;
		}),
	});
});

it("excludes environments that are not the user's by default", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
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
	const repositoryName = await manager.project.getRepositoryName();

	const productionEnvironment: Environment = {
		kind: "prod",
		domain: repositoryName,
		name: repositoryName,
		users: [{ id: shortId }],
	};
	const thisUsersEnvironment: Environment = {
		kind: "dev",
		domain: `${repositoryName}-bar`,
		name: "bar",
		users: [{ id: shortId }],
	};
	const someoneElsesEnvironment: Environment = {
		kind: "dev",
		domain: `${repositoryName}-baz`,
		name: "baz",
		users: [{ id: "user-baz" }],
	};
	const environments: Environment[] = [
		productionEnvironment,
		thisUsersEnvironment,
		someoneElsesEnvironment,
	];

	mockSliceMachineAPI(ctx, {
		environmentsV1Endpoint: {
			expectedAuthenticationToken: authenticationToken,
			expectedCookies: prismicAuthLoginResponse.cookies,
			environments,
		},
	});

	const res = await manager.prismicRepository.fetchEnvironments();

	expect(res).toStrictEqual({
		environments: [productionEnvironment, thisUsersEnvironment],
	});
});

it("includes all environments if configured", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
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
	const repositoryName = await manager.project.getRepositoryName();

	const productionEnvironment: Environment = {
		kind: "prod",
		domain: repositoryName,
		name: repositoryName,
		users: [{ id: shortId }],
	};
	const thisUsersEnvironment: Environment = {
		kind: "dev",
		domain: `${repositoryName}-bar`,
		name: "bar",
		users: [{ id: shortId }],
	};
	const someoneElsesEnvironment: Environment = {
		kind: "dev",
		domain: `${repositoryName}-baz`,
		name: "baz",
		users: [{ id: "user-baz" }],
	};
	const environments: Environment[] = [
		productionEnvironment,
		thisUsersEnvironment,
		someoneElsesEnvironment,
	];

	mockSliceMachineAPI(ctx, {
		environmentsV1Endpoint: {
			expectedAuthenticationToken: authenticationToken,
			expectedCookies: prismicAuthLoginResponse.cookies,
			environments,
		},
	});

	const res = await manager.prismicRepository.fetchEnvironments({
		includeAll: true,
	});

	expect(res).toStrictEqual({ environments });
});

it("throws if the repository API call was unsuccessful", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockPrismicUserAPI(ctx);
	mockPrismicAuthAPI(ctx);

	const prismicAuthLoginResponse = createPrismicAuthLoginResponse();
	await manager.user.login(prismicAuthLoginResponse);

	const authenticationToken = await manager.user.getAuthenticationToken();

	mockSliceMachineAPI(ctx, {
		environmentsV1Endpoint: {
			isSuccessful: false,
			expectedAuthenticationToken: authenticationToken,
			expectedCookies: prismicAuthLoginResponse.cookies,
			environments: [],
		},
	});

	const res = await manager.prismicRepository.fetchEnvironments();

	expect(res).toStrictEqual({
		error: new Error("Failed to fetch environments."),
	});
});

it("throws if the API response was invalid", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockPrismicUserAPI(ctx);
	mockPrismicAuthAPI(ctx);

	const prismicAuthLoginResponse = createPrismicAuthLoginResponse();
	await manager.user.login(prismicAuthLoginResponse);

	const authenticationToken = await manager.user.getAuthenticationToken();

	mockSliceMachineAPI(ctx, {
		environmentsV1Endpoint: {
			isSuccessful: false,
			expectedAuthenticationToken: authenticationToken,
			expectedCookies: prismicAuthLoginResponse.cookies,
			environments: [
				{
					// @ts-expect-error - We are purposely providing invalid data.
					invalid: true,
				},
			],
		},
	});

	const res = await manager.prismicRepository.fetchEnvironments();

	expect(res).toStrictEqual({
		error: new Error("Failed to fetch environments."),
	});
});

it("throws UnauthenticatedError if the API returns 400", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockPrismicUserAPI(ctx);
	mockPrismicAuthAPI(ctx);

	const prismicAuthLoginResponse = createPrismicAuthLoginResponse();
	await manager.user.login(prismicAuthLoginResponse);

	ctx.msw.use(
		rest.get(
			new URL(
				"./environments",
				manager.getAPIEndpoints().SliceMachineV1,
			).toString(),
			(_req, res, ctx) => {
				return res(ctx.status(400));
			},
		),
	);

	const res = await manager.prismicRepository.fetchEnvironments();

	expect(res).toStrictEqual({ error: new UnauthenticatedError() });
});

it("throws UnauthenticatedError if the API returns 401", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockPrismicUserAPI(ctx);
	mockPrismicAuthAPI(ctx);

	const prismicAuthLoginResponse = createPrismicAuthLoginResponse();
	await manager.user.login(prismicAuthLoginResponse);

	ctx.msw.use(
		rest.get(
			new URL(
				"./environments",
				manager.getAPIEndpoints().SliceMachineV1,
			).toString(),
			(_req, res, ctx) => {
				return res(ctx.status(401));
			},
		),
	);

	const res = await manager.prismicRepository.fetchEnvironments();

	expect(res).toStrictEqual({ error: new UnauthenticatedError() });
});

it("throws UnauthorizedError if the API returns 403", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockPrismicUserAPI(ctx);
	mockPrismicAuthAPI(ctx);

	const prismicAuthLoginResponse = createPrismicAuthLoginResponse();
	await manager.user.login(prismicAuthLoginResponse);

	ctx.msw.use(
		rest.get(
			new URL(
				"./environments",
				manager.getAPIEndpoints().SliceMachineV1,
			).toString(),
			(_req, res, ctx) => {
				return res(ctx.status(403));
			},
		),
	);

	const res = await manager.prismicRepository.fetchEnvironments();

	expect(res).toStrictEqual({ error: new UnauthorizedError() });
});

it("throws if not logged in", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.user.logout();

	const res = await manager.prismicRepository.fetchEnvironments();

	expect(res).toStrictEqual({ error: new UnauthenticatedError() });
});
