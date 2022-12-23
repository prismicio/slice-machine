import { expect, it } from "vitest";

import { createPrismicAuthLoginResponse } from "./__testutils__/createPrismicAuthLoginResponse";
import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";

import { createSliceMachineManager } from "../src";

it("returns all repositories for the logged in user", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockPrismicUserAPI(ctx, { repositoriesEndpoint: false });
	mockPrismicAuthAPI(ctx);

	const prismicAuthLoginResponse = createPrismicAuthLoginResponse();
	await manager.user.login(prismicAuthLoginResponse);

	const authenticationToken = await manager.user.getAuthenticationToken();

	const repositories = [
		{
			domain: "foo",
			name: "Foo",
			role: "Owner",
		},
		{
			domain: "bar",
			name: "Bar",
			role: "Writer",
		},
	];

	mockPrismicUserAPI(ctx, {
		profileEndpoint: false,
		repositoriesEndpoint: {
			expectedAuthenticationToken: authenticationToken,
			expectedCookies: prismicAuthLoginResponse.cookies,
			repositories,
		},
	});

	const res = await manager.prismicRepository.readAll();

	expect(res).toStrictEqual(repositories);
});

it("throws if the repository API call was unsuccessful", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockPrismicUserAPI(ctx, { repositoriesEndpoint: false });
	mockPrismicAuthAPI(ctx);

	await manager.user.login(createPrismicAuthLoginResponse());

	mockPrismicUserAPI(ctx, {
		profileEndpoint: false,
		repositoriesEndpoint: {
			isSuccessful: false,
		},
	});

	await expect(async () => {
		await manager.prismicRepository.readAll();
	}).rejects.toThrow(/failed to read repositories/i);
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
		await manager.prismicRepository.readAll();
	}).rejects.toThrow(/not logged in/i);
});
