import { expect, it } from "vitest";

import { createPrismicAuthLoginResponse } from "./__testutils__/createPrismicAuthLoginResponse";
import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { mockPrismicRepositoryAPI } from "./__testutils__/mockPrismicRepositoryAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";

import { createSliceMachineManager } from "../src";

// TODO: The endpoint is called more than once. Why?
it.skip("pushes a given set of documents to a given repository", async (ctx) => {
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
	const documents = {
		baz: [{ qux: "quux" }],
		corge: [{ grault: "garply" }],
	};

	mockPrismicRepositoryAPI(ctx, {
		starterDocumentsEndpoint: {
			expectedAuthenticationToken: authenticationToken,
			expectedCookies: prismicAuthLoginResponse.cookies,
			domain: "foo",
			signature: "bar",
			documents,
		},
	});

	let count = 0;
	ctx.msw.events.on("request:match", (req) => {
		if (req.url.toString() === "https://foo.prismic.io/starter/documents") {
			count++;
		}
	});

	await manager.prismicRepository.pushDocuments({
		domain: "foo",
		signature: "bar",
		documents,
	});

	expect(count).toBe(1);
});

// TODO: `await res.text()` in `pushDocuments()` times out.
it.skip("throws if the repository already contains documents", async (ctx) => {
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
	const documents = {
		baz: [{ qux: "quux" }],
		corge: [{ grault: "garply" }],
	};

	mockPrismicRepositoryAPI(ctx, {
		starterDocumentsEndpoint: {
			isSuccessful: false,
			failureReason: "Repository should not contain documents",
			expectedAuthenticationToken: authenticationToken,
			expectedCookies: prismicAuthLoginResponse.cookies,
			domain: "foo",
			signature: "bar",
			documents,
		},
	});

	await expect(async () => {
		await manager.prismicRepository.pushDocuments({
			domain: "foo",
			signature: "bar",
			documents,
		});
	}).rejects.toThrow(/failed to push documents/i);
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
	const documents = {
		baz: [{ qux: "quux" }],
		corge: [{ grault: "garply" }],
	};

	mockPrismicRepositoryAPI(ctx, {
		starterDocumentsEndpoint: {
			isSuccessful: false,
			expectedAuthenticationToken: authenticationToken,
			expectedCookies: prismicAuthLoginResponse.cookies,
			domain: "foo",
			signature: "bar",
			documents,
		},
	});

	await expect(async () => {
		await manager.prismicRepository.pushDocuments({
			domain: "foo",
			signature: "bar",
			documents,
		});
	}).rejects.toThrow(/failed to push documents/i);
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
