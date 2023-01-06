import * as path from "node:path";

import { beforeEach, expect, it } from "vitest";

import { createSliceMachineInitProcess } from "../src";

import { mockPrismicRepositoryManager } from "./__testutils__/mockPrismicRepositoryManager";
import { setContext } from "./__testutils__/setContext";
import { updateContext } from "./__testutils__/updateContext";
import { updateOptions } from "./__testutils__/updateOptions";
import { watchStd } from "./__testutils__/watchStd";

const initProcess = createSliceMachineInitProcess({
	cwd: path.resolve(__dirname, "__fixtures__/base"),
});

beforeEach(() => {
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
});

it("uses repository flag", async () => {
	const domain = "new-repo";
	updateOptions(initProcess, { repository: domain });

	const prismicRepositorySpy = mockPrismicRepositoryManager(initProcess, {
		existingRepositories: [],
	});

	await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.useRepositoryFlag();
	});

	expect(prismicRepositorySpy.checkExists).toHaveBeenCalledOnce();
	expect(prismicRepositorySpy.checkExists).toHaveBeenNthCalledWith(1, {
		domain,
	});
	// @ts-expect-error - Accessing protected property
	expect(initProcess.context.repository).toStrictEqual({
		domain,
		exists: false,
	});
});

it("formats and uses repository flag", async () => {
	const rawDomain = "New Repo";
	const domain = "new-repo";
	updateOptions(initProcess, { repository: rawDomain });

	const prismicRepositorySpy = mockPrismicRepositoryManager(initProcess, {
		existingRepositories: [],
	});

	await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.useRepositoryFlag();
	});

	expect(prismicRepositorySpy.checkExists).toHaveBeenCalledOnce();
	expect(prismicRepositorySpy.checkExists).toHaveBeenNthCalledWith(1, {
		domain,
	});
	// @ts-expect-error - Accessing protected property
	expect(initProcess.context.repository).toStrictEqual({
		domain,
		exists: false,
	});
});

it("uses repository flag with existing user repository", async () => {
	const domain = "repo-admin";
	updateOptions(initProcess, { repository: domain });

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
	updateOptions(initProcess, { repository: rawDomain });

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
	updateOptions(initProcess, { repository: domain });

	await expect(
		watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.useRepositoryFlag();
		}),
	).rejects.toThrowErrorMatchingInlineSnapshot(
		'"Cannot run init command with repository [36mrepo-writer[39m: you are not a developer or admin of this repository"',
	);
});

it("throws if user is not a member of the repository (already exists)", async () => {
	const domain = "existing-repo";
	updateOptions(initProcess, { repository: domain });

	const prismicRepositorySpy = mockPrismicRepositoryManager(initProcess, {
		existingRepositories: [domain],
	});

	await expect(
		watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.useRepositoryFlag();
		}),
	).rejects.toThrowErrorMatchingInlineSnapshot(
		'"Repository name [36mexisting-repo[39m is already taken"',
	);
	expect(prismicRepositorySpy.checkExists).toHaveBeenCalledOnce();
	expect(prismicRepositorySpy.checkExists).toHaveBeenNthCalledWith(1, {
		domain,
	});
});

it("throws if repository name is too short", async () => {
	const domain = "s";
	updateOptions(initProcess, { repository: domain });

	await expect(
		watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.useRepositoryFlag();
		}),
	).rejects.toThrowErrorMatchingInlineSnapshot(
		'"Repository name [36ms[39m must be 4 characters long or more"',
	);
});

it("throws if repository name is too long", async () => {
	const domain =
		"lorem-ipsum-dolor-sit-amet-consectetur-adipisicing-elit-Officiis-incidunt-ex-harum";
	updateOptions(initProcess, { repository: domain });

	await expect(
		watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.useRepositoryFlag();
		}),
	).rejects.toThrowErrorMatchingInlineSnapshot(
		'"Repository name [36mlorem-ipsum-dolor-sit-amet-consectetur-adipisicing-elit-officiis-incidunt-ex-harum[39m must be 30 characters long or less"',
	);
});

it("throws if context is missing user repositories", async () => {
	const domain = "new-repo";
	updateOptions(initProcess, { repository: domain });
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
	updateOptions(initProcess, { repository: undefined });

	await expect(
		watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.useRepositoryFlag();
		}),
	).rejects.toThrowErrorMatchingInlineSnapshot(
		'"Flag `repository` must be set to run `useRepositoryFlag`"',
	);
});
