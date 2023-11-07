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

	mockPrismicUserAPI(ctx);
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
			users: [{ id: "id" }],
		},
		{
			kind: "stage",
			domain: `${repositoryName}-foo`,
			name: "foo",
			users: [{ id: "id" }],
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

	expect(res).toStrictEqual(environments);
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

	await expect(async () => {
		await manager.prismicRepository.fetchEnvironments();
	}).rejects.toThrow(/failed to fetch environments/i);
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

	await expect(async () => {
		await manager.prismicRepository.fetchEnvironments();
	}).rejects.toThrow(/failed to fetch environments/i);
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
				"https://slice-machine-api.example/",
			).toString(),
			(_req, res, ctx) => {
				return res(ctx.status(401));
			},
		),
	);

	await expect(async () => {
		await manager.prismicRepository.fetchEnvironments();
	}).rejects.toThrow(UnauthenticatedError);
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
				"https://slice-machine-api.example/",
			).toString(),
			(_req, res, ctx) => {
				return res(ctx.status(403));
			},
		),
	);

	await expect(async () => {
		await manager.prismicRepository.fetchEnvironments();
	}).rejects.toThrow(UnauthorizedError);
});

it("throws if not logged in", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.user.logout();

	await expect(async () => {
		await manager.prismicRepository.fetchEnvironments();
	}).rejects.toThrow(UnauthenticatedError);
});
