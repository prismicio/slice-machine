import { beforeEach, expect, it, TestContext } from "vitest";

import { createSliceMachineInitProcess, SliceMachineInitProcess } from "../src";
import { UNIVERSAL } from "../src/lib/framework";

import { createPrismicAuthLoginResponse } from "./__testutils__/createPrismicAuthLoginResponse";
import { mockPrismicRepositoryAPI } from "./__testutils__/mockPrismicRepositoryAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { loginUser } from "./__testutils__/loginUser";
import { setContext } from "./__testutils__/setContext";
import { updateContext } from "./__testutils__/updateContext";
import { spyManager } from "./__testutils__/spyManager";
import { watchStd } from "./__testutils__/watchStd";

const initProcess = createSliceMachineInitProcess();
const spiedManager = spyManager(initProcess);

beforeEach(() => {
	setContext(initProcess, {
		framework: UNIVERSAL,
		repository: {
			domain: "new-repo",
			exists: false,
		},
	});
});

const mockPrismicAPIs = async (
	ctx: TestContext,
	initProcess: SliceMachineInitProcess,
	domain?: string,
): Promise<void> => {
	const prismicAuthLoginResponse = createPrismicAuthLoginResponse();
	mockPrismicUserAPI(ctx);
	mockPrismicAuthAPI(ctx);
	const token = await loginUser(initProcess, prismicAuthLoginResponse);

	mockPrismicRepositoryAPI(ctx, {
		newEndpoint: {
			expectedAuthenticationToken: token,
			expectedCookies: prismicAuthLoginResponse.cookies,
			// @ts-expect-error - Accessing protected property
			domain: domain ?? initProcess.context.repository?.domain,
		},
	});
};

it("creates repository from context", async (ctx) => {
	await mockPrismicAPIs(ctx, initProcess);

	await watchStd(async () => {
		// @ts-expect-error - Accessing protected method
		return initProcess.createNewRepository();
	});

	expect(spiedManager.prismicRepository.create).toHaveBeenCalledOnce();
	expect(spiedManager.prismicRepository.create).toHaveBeenNthCalledWith(1, {
		domain: "new-repo",
		framework: UNIVERSAL.prismicName,
	});
	// @ts-expect-error - Accessing protected property
	expect(initProcess.context.repository?.exists).toBe(true);
});

it("throws if context is missing framework", async () => {
	updateContext(initProcess, {
		framework: undefined,
	});

	await expect(
		watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.createNewRepository();
		}),
	).rejects.toThrowErrorMatchingInlineSnapshot(
		'"Project framework must be available through context to run `createNewRepository`"',
	);
});

it("throws if context is missing repository", async () => {
	updateContext(initProcess, {
		repository: undefined,
	});

	await expect(
		watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.createNewRepository();
		}),
	).rejects.toThrowErrorMatchingInlineSnapshot(
		'"Repository selection must be available through context to run `createNewRepository`"',
	);
});
