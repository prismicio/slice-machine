import { describe, expect, it } from "vitest";

describe("GitHub", () => {
	it("returns an installation URL", async ({ manager, api, login }) => {
		api.mockSliceMachineV1(
			"./git/github/create-auth-state",
			{ key: "key", expiresAt: new Date().toISOString() },
			{ method: "post" },
		);

		await login();
		const res = await manager.git.getProviderAppInstallURL({
			provider: "gitHub",
		});

		expect(res).toBe(
			"https://github.com/apps/prismic-io/installations/new?state=key",
		);
	});
});
