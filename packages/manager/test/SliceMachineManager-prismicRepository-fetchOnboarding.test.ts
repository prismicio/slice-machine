import { expect, it } from "vitest";

import { createPrismicAuthLoginResponse } from "./__testutils__/createPrismicAuthLoginResponse";
import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";
import { mockRepositoryServiceAPI } from "./__testutils__/mockRepositoryServiceAPI";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";

it("returns onboarding state for the logged in user", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockPrismicAuthAPI(ctx);

	const prismicAuthLoginResponse = createPrismicAuthLoginResponse();
	const authenticationToken = await manager.user.getAuthenticationToken();
	await manager.user.login(prismicAuthLoginResponse);

	const steps = ["reviewAndPush", "codePage", "createContent"];
	mockRepositoryServiceAPI(ctx, {
		fetchEndpoint: {
			steps,
			expectedAuthenticationToken: authenticationToken,
			expectedCookies: prismicAuthLoginResponse.cookies,
		},
	});

	const res = await manager.prismicRepository.fetchOnboarding();

	expect(res).toStrictEqual({
		completedSteps: steps,
		isDismissed: false,
		context: {
			framework: "next",
			starterId: null,
		},
	});
});
