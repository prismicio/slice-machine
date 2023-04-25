import { expect, it, TestContext } from "vitest";

import { createSliceMachineInitProcess, SliceMachineInitProcess } from "../src";

import { createPrismicAuthLoginResponse } from "./__testutils__/createPrismicAuthLoginResponse";
import { mockPrismicRepositoryAPI } from "./__testutils__/mockPrismicRepositoryAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { loginUser } from "./__testutils__/loginUser";
import { setContext } from "./__testutils__/setContext";
import { updateContext } from "./__testutils__/updateContext";
import { spyManager } from "./__testutils__/spyManager";
import { watchStd } from "./__testutils__/watchStd";

const setDefaultContext = (initProcess: SliceMachineInitProcess) => {
	setContext(initProcess, {
		userRepositories: [
			{
				domain: "repo-admin",
				name: "Repo Admin",
				role: "Administrator",
			},
			{
				domain: "repo-writer",
				name: "Repo Writer",
				role: "Writer",
			},
		],
	});
};

const mockPrismicAPIs = async (
	ctx: TestContext,
	initProcess: SliceMachineInitProcess,
	existingRepositories: string[] = [],
): Promise<void> => {
	const prismicAuthLoginResponse = createPrismicAuthLoginResponse();
	mockPrismicUserAPI(ctx);
	mockPrismicAuthAPI(ctx);
	const token = await loginUser(initProcess, prismicAuthLoginResponse);

	mockPrismicRepositoryAPI(ctx, {
		existsEndpoint: {
			expectedAuthenticationToken: token,
			expectedCookies: prismicAuthLoginResponse.cookies,
			existingRepositories,
		},
	});
};

it("uses repository flag", async (ctx) => {
	const domain = "new-repo";
	const initProcess = createSliceMachineInitProcess({ repository: domain });
	setDefaultContext(initProcess);
	const spiedManager = spyManager(initProcess);
	await mockPrismicAPIs(ctx, initProcess, []);

	await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.useRepositoryFlag();
	});

	expect(spiedManager.prismicRepository.checkExists).toHaveBeenCalledOnce();
	expect(spiedManager.prismicRepository.checkExists).toHaveBeenNthCalledWith(
		1,
		{
			domain,
		},
	);
	// @ts-expect-error - Accessing protected property
	expect(initProcess.context.repository).toStrictEqual({
		domain,
		exists: false,
	});
});

it("formats and uses repository flag", async (ctx) => {
	const rawDomain = "New Repo";
	const domain = "new-repo";
	const initProcess = createSliceMachineInitProcess({ repository: rawDomain });
	setDefaultContext(initProcess);
	const spiedManager = spyManager(initProcess);
	await mockPrismicAPIs(ctx, initProcess, []);

	await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.useRepositoryFlag();
	});

	expect(spiedManager.prismicRepository.checkExists).toHaveBeenCalledOnce();
	expect(spiedManager.prismicRepository.checkExists).toHaveBeenNthCalledWith(
		1,
		{
			domain,
		},
	);
	// @ts-expect-error - Accessing protected property
	expect(initProcess.context.repository).toStrictEqual({
		domain,
		exists: false,
	});
});

it("uses repository flag with existing user repository", async () => {
	const domain = "repo-admin";
	const initProcess = createSliceMachineInitProcess({ repository: domain });
	setDefaultContext(initProcess);

	await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.useRepositoryFlag();
	});

	// @ts-expect-error - Accessing protected property
	expect(initProcess.context.repository).toStrictEqual({
		domain,
		exists: true,
	});
});

it("formats and uses repository flag with existing user repository", async () => {
	const rawDomain = "Repo Admin";
	const domain = "repo-admin";
	const initProcess = createSliceMachineInitProcess({ repository: rawDomain });
	setDefaultContext(initProcess);

	await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.useRepositoryFlag();
	});

	// @ts-expect-error - Accessing protected property
	expect(initProcess.context.repository).toStrictEqual({
		domain,
		exists: true,
	});
});

it("throws if user does not have write access to repository", async () => {
	const domain = "repo-writer";
	const initProcess = createSliceMachineInitProcess({ repository: domain });
	setDefaultContext(initProcess);

	await expect(
		watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.useRepositoryFlag();
		}),
	).rejects.toThrowErrorMatchingInlineSnapshot(
		'"Cannot run init command with repository repo-writer: you are not a developer or admin of this repository"',
	);
});

it("throws if user is not a member of the repository (already exists)", async (ctx) => {
	const domain = "existing-repo";
	const initProcess = createSliceMachineInitProcess({ repository: domain });
	setDefaultContext(initProcess);
	const spiedManager = spyManager(initProcess);
	await mockPrismicAPIs(ctx, initProcess, [domain]);

	await expect(
		watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.useRepositoryFlag();
		}),
	).rejects.toThrowErrorMatchingInlineSnapshot(
		'"Repository name existing-repo is already taken"',
	);
	expect(spiedManager.prismicRepository.checkExists).toHaveBeenCalledOnce();
	expect(spiedManager.prismicRepository.checkExists).toHaveBeenNthCalledWith(
		1,
		{
			domain,
		},
	);
});

it("throws if repository name is too short", async () => {
	const domain = "s";
	const initProcess = createSliceMachineInitProcess({ repository: domain });
	setDefaultContext(initProcess);

	await expect(
		watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.useRepositoryFlag();
		}),
	).rejects.toThrowErrorMatchingInlineSnapshot(
		'"Repository name s must be 4 characters long or more"',
	);
});

it("throws if repository name is too long", async () => {
	const domain =
		"lorem-ipsum-dolor-sit-amet-consectetur-adipisicing-elit-officiis-incidunt-ex-harum";
	const initProcess = createSliceMachineInitProcess({ repository: domain });
	setDefaultContext(initProcess);

	await expect(
		watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.useRepositoryFlag();
		}),
	).rejects.toThrowErrorMatchingInlineSnapshot(
		'"Repository name lorem-ipsum-dolor-sit-amet-consectetur-adipisicing-elit-officiis-incidunt-ex-harum must be 30 characters long or less"',
	);
});

it("throws if context is missing user repositories", async () => {
	const domain = "new-repo";
	const initProcess = createSliceMachineInitProcess({ repository: domain });
	setDefaultContext(initProcess);
	updateContext(initProcess, {
		userRepositories: undefined,
	});

	await expect(
		watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.useRepositoryFlag();
		}),
	).rejects.toThrowErrorMatchingInlineSnapshot(
		'"User repositories must be available through context to run `useRepositoryFlag`"',
	);
});

it("throws if options is missing repository", async () => {
	const initProcess = createSliceMachineInitProcess();
	setDefaultContext(initProcess);

	await expect(
		watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.useRepositoryFlag();
		}),
	).rejects.toThrowErrorMatchingInlineSnapshot(
		'"Flag `repository` must be set to run `useRepositoryFlag`"',
	);
});
