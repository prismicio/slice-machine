import { expect, it } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";

import { createSliceMachineManager, UnauthenticatedError } from "../src";

it("returns parsed cookies from the auth state file", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockPrismicAuthAPI(ctx);
	mockPrismicUserAPI(ctx);

	await manager.user.login({
		email: "name@example.com",
		cookies: ["prismic-auth=token", "SESSION=session"],
	});

	const authenticationCookies = await manager.user.getAuthenticationCookies();

	expect(authenticationCookies).toStrictEqual({
		"prismic-auth": "token",
		SESSION: "session",
	});
});

it("throws if the user is not logged in", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.user.logout();

	expect(async () => {
		await manager.user.getAuthenticationCookies();
	}).rejects.toThrow(UnauthenticatedError);
});
