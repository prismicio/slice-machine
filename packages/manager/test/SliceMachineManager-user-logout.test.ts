import { expect, it } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";
import { readPrismicAuthState } from "./__testutils__/readPrismicAuthState";

import { createSliceMachineManager } from "../src";

it("removes user-specific data from the auth state file", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockPrismicUserAPI(ctx);

	await manager.user.login({
		email: "name@example.com",
		cookies: ["prismic-auth=token", "SESSION=session"],
	});

	await manager.user.logout();

	const authState = await readPrismicAuthState();

	expect(authState?.cookies).toBe("");
	expect(authState?.shortId).toBe(undefined);
	expect(authState?.intercomHash).toBe(undefined);
});
