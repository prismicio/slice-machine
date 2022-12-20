import { expect, it } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";
import { readPrismicAuthState } from "./__testutils__/readPrismicAuthState";

import { createSliceMachineManager } from "../src";

it("updates the auth state file with the given login info", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	const { profile } = mockPrismicUserAPI(ctx);

	await manager.user.login({
		email: "name@example.com",
		cookies: ["prismic-auth=token", "SESSION=session"],
	});

	const authState = await readPrismicAuthState();

	expect(authState).toStrictEqual({
		base: "https://prismic.io/",
		cookies: "prismic-auth=token; SESSION=session",
		shortId: profile.shortId,
		intercomHash: profile.intercomHash,
	});
});

it("retains existing cookies in the auth state file", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockPrismicUserAPI(ctx);

	await manager.user.login({
		email: "name@example.com",
		cookies: ["foo=bar"],
	});
	await manager.user.login({
		email: "name@example.com",
		cookies: ["prismic-auth=token", "SESSION=session"],
	});

	const authState = await readPrismicAuthState();

	expect(authState?.cookies).toBe(
		"foo=bar; prismic-auth=token; SESSION=session",
	);
});
