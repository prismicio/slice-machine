import { expect, it } from "vitest";

import { createPrismicAuthLoginResponse } from "./__testutils__/createPrismicAuthLoginResponse";
import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { mockPrismicRepositoryAPI } from "./__testutils__/mockPrismicRepositoryAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";

import { createSliceMachineManager } from "../src";

// TODO: This test times out. It seems like a bug in MSW or node-fetch.
// `create()` times out when it tries to read the network response's text via
// `await res.text()`.
it.skip("creates a Prismic repository", async (ctx) => {
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
		newEndpoint: {
			expectedAuthenticationToken: authenticationToken,
			expectedCookies: prismicAuthLoginResponse.cookies,
			domain: "foo",
			framework: "bar",
		},
	});

	let count = 0;
	ctx.msw.events.on("request:match", (req) => {
		if (
			req.url.toString() ===
			"https://prismic.io/authentication/newrepository?app=slicemachine"
		) {
			count++;
		}
	});

	await manager.prismicRepository.create({
		domain: "foo",
		framework: "bar",
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
		newEndpoint: {
			isSuccessful: false,
			expectedAuthenticationToken: authenticationToken,
			expectedCookies: prismicAuthLoginResponse.cookies,
			domain: "foo",
			framework: "bar",
		},
	});

	await expect(async () => {
		await manager.prismicRepository.create({
			domain: "foo",
			framework: "bar",
		});
	}).rejects.toThrow(/failed to create repository/i);
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
		await manager.prismicRepository.create({
			domain: "foo",
			framework: "bar",
		});
	}).rejects.toThrow(/not logged in/i);
});
