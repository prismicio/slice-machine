import { expect, it } from "vitest";

import { createPrismicAuthLoginResponse } from "./__testutils__/createPrismicAuthLoginResponse";
import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";
import { readPrismicAuthState } from "./__testutils__/readPrismicAuthState";

import { createSliceMachineManager } from "../src";

it("returns true if the user is logged in", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockPrismicAuthAPI(ctx);
	mockPrismicUserAPI(ctx);

	await manager.user.login(createPrismicAuthLoginResponse());

	const res = await manager.user.checkIsLoggedIn();

	expect(res).toBe(true);
});

it("returns false if the user is logged out", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockPrismicAuthAPI(ctx);

	await manager.user.logout();

	const res = await manager.user.checkIsLoggedIn();

	expect(res).toBe(false);
});

it("returns false if the user is logged in with an expired token", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockPrismicAuthAPI(ctx, {
		validateEndpoint: {
			isValid: false,
		},
	});
	mockPrismicUserAPI(ctx);

	await manager.user.login(createPrismicAuthLoginResponse());

	const res = await manager.user.checkIsLoggedIn();

	expect(res).toBe(false);
});

it("logs out the user if they are logged in with an expired token", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockPrismicAuthAPI(ctx, {
		validateEndpoint: {
			isValid: false,
		},
	});
	mockPrismicUserAPI(ctx);

	await manager.user.login(createPrismicAuthLoginResponse());

	await manager.user.checkIsLoggedIn();

	const authState = await readPrismicAuthState();

	expect(authState?.cookies).toBe("");
	expect(authState?.shortId).toBe(undefined);
	expect(authState?.intercomHash).toBe(undefined);
});
