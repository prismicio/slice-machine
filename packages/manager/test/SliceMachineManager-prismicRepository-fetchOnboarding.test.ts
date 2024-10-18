import { expect, it } from "vitest";

import { createPrismicAuthLoginResponse } from "./__testutils__/createPrismicAuthLoginResponse";
import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { UnauthenticatedError, createSliceMachineManager } from "../src";
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
	await manager.user.login(prismicAuthLoginResponse);
	const authenticationToken = await manager.user.getAuthenticationToken();

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

it("toggles an onboarding step and returns the new completedSteps", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockPrismicAuthAPI(ctx);

	const prismicAuthLoginResponse = createPrismicAuthLoginResponse();
	await manager.user.login(prismicAuthLoginResponse);
	const authenticationToken = await manager.user.getAuthenticationToken();

	mockRepositoryServiceAPI(ctx, {
		toggleStepEndpoint: {
			steps: ["reviewAndPush", "codePage", "createContent"],
			expectedAuthenticationToken: authenticationToken,
			expectedCookies: prismicAuthLoginResponse.cookies,
		},
	});

	const res =
		await manager.prismicRepository.toggleOnboardingStep("reviewAndPush");

	expect(res).toStrictEqual({ completedSteps: ["codePage", "createContent"] });
});

it("toggles onboarding", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockPrismicAuthAPI(ctx);

	const prismicAuthLoginResponse = createPrismicAuthLoginResponse();
	await manager.user.login(prismicAuthLoginResponse);
	const authenticationToken = await manager.user.getAuthenticationToken();

	mockRepositoryServiceAPI(ctx, {
		toggleEndpoint: {
			isDismissed: true,
			expectedAuthenticationToken: authenticationToken,
			expectedCookies: prismicAuthLoginResponse.cookies,
		},
	});

	const res = await manager.prismicRepository.toggleOnboarding();

	expect(res).toStrictEqual({ isDismissed: true });
});

it("throws if the API response was invalid", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockPrismicAuthAPI(ctx);

	const prismicAuthLoginResponse = createPrismicAuthLoginResponse();
	await manager.user.login(prismicAuthLoginResponse);

	const authenticationToken = await manager.user.getAuthenticationToken();

	mockRepositoryServiceAPI(ctx, {
		fetchEndpoint: {
			steps: [],
			invalid: true,
			expectedAuthenticationToken: authenticationToken,
			expectedCookies: prismicAuthLoginResponse.cookies,
		},
	});

	await expect(async () => {
		await manager.prismicRepository.fetchOnboarding();
	}).rejects.toThrow(/Failed to decode onboarding/i);
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
		await manager.prismicRepository.fetchOnboarding();
	}).rejects.toThrow(UnauthenticatedError);
});
