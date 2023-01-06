import { expect, it } from "vitest";

import { createPrismicAuthLoginResponse } from "./__testutils__/createPrismicAuthLoginResponse";
import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { mockPrismicRepositoryAPI } from "./__testutils__/mockPrismicRepositoryAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";

import { createSliceMachineManager } from "../src";

// TODO: This test is unfinished. Is this method necessary? It doesn't seem to
// be used anywhere.
it.skip("deletes a Prismic repository", async (ctx) => {
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
		deleteEndpoint: {
			expectedAuthenticationToken: authenticationToken,
			expectedCookies: [...prismicAuthLoginResponse.cookies, "X_XSRF=xsrf"],
			domain: "foo",
			password: "bar",
		},
	});

	let count = 0;
	ctx.msw.events.on("request:match", (req) => {
		if (
			req.url.toString() === "https://foo.prismic.io/app/settings/delete?_=xsrf"
		) {
			count++;
		}
	});

	await manager.prismicRepository.delete({
		domain: "foo",
		password: "bar",
	});

	expect(count).toBe(1);
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
		deleteEndpoint: {
			isSuccessful: false,
			expectedAuthenticationToken: authenticationToken,
			expectedCookies: prismicAuthLoginResponse.cookies,
			domain: "foo",
			password: "bar",
		},
	});

	await expect(async () => {
		await manager.prismicRepository.delete({
			domain: "foo",
			password: "bar",
		});
	}).rejects.toThrow(/failed to delete repository/i);
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
		await manager.prismicRepository.delete({
			domain: "foo",
			password: "bar",
		});
	}).rejects.toThrow(/not logged in/i);
});
