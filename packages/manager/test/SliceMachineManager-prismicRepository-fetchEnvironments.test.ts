import { expect, it } from "vitest";

import { createPrismicAuthLoginResponse } from "./__testutils__/createPrismicAuthLoginResponse";
import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";
import { mockPrismicRepositoryAPI } from "./__testutils__/mockPrismicRepositoryAPI";

import { createSliceMachineManager } from "../src";
import { Environment } from "../src/managers/prismicRepository/types";
import { UnauthenticatedError } from "../src/errors";

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
			avatarColor: "#FF00FF",
			uploadedAvatar: null,
			createdAt: 1664309250645,
			lastUpdated: 1696903383052,
			importId: "importId",
			pendingUsers: [
				{
					email: "email",
					inviterEmail: "inviterEmail",
					status: "pending_user",
					profileId: "Manager",
				},
			],
			authorizedUser: true,
			authorizedAdmin: true,
		},
		{
			kind: "stage",
			domain: `${repositoryName}-foo`,
			name: "foo",
			avatarColor: "#FF00FF",
			uploadedAvatar: null,
			createdAt: 1664309250645,
			lastUpdated: 1696903383052,
			importId: "importId",
			pendingUsers: [
				{
					email: "email",
					inviterEmail: "inviterEmail",
					status: "pending_user",
					profileId: "Manager",
				},
			],
			authorizedUser: true,
			authorizedAdmin: true,
		},
	];

	mockPrismicRepositoryAPI(ctx, {
		environmentsEndpoint: {
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

	mockPrismicRepositoryAPI(ctx, {
		environmentsEndpoint: {
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

	mockPrismicRepositoryAPI(ctx, {
		environmentsEndpoint: {
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
