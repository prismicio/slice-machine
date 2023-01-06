import * as path from "node:path";

import { beforeEach, expect, it } from "vitest";
import { stdin as mockStdin } from "mock-stdin";

import { createSliceMachineInitProcess } from "../src";

import { mockPrismicRepositoryManager } from "./__testutils__/mockPrismicRepositoryManager";
import { setContext } from "./__testutils__/setContext";
import { updateContext } from "./__testutils__/updateContext";
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

it("prompts user to select a repository from existing ones", async () => {
	await watchStd(async () => {
		const stdin = mockStdin();

		// @ts-expect-error - Accessing protected method
		const promise = initProcess.selectRepository();

		await new Promise((res) => setTimeout(res, 50));

		// Arrow down, enter
		stdin.send("\x1b[B").send("\n").restore();

		return promise;
	});

	// @ts-expect-error - Accessing protected property
	expect(initProcess.context.repository).toStrictEqual({
		domain: "repo-admin",
		exists: true,
	});
});

it("prevents user from selecting a repository they don't have write access on", async () => {
	await watchStd(async () => {
		const stdin = mockStdin();

		// @ts-expect-error - Accessing protected method
		const promise = initProcess.selectRepository();

		await new Promise((res) => setTimeout(res, 50));

		// Arrow down, arrow down, enter
		stdin.send("\x1b[B").send("\x1b[B").send("\n");

		// Arrow up, enter
		stdin.send("\x1b[A").send("\n").restore();

		return promise;
	});

	// @ts-expect-error - Accessing protected property
	expect(initProcess.context.repository).toStrictEqual({
		domain: "repo-admin",
		exists: true,
	});
});

it("allows user to create a new repository and prompts for its name", async () => {
	const domain = "new-repo";
	mockPrismicRepositoryManager(initProcess, { existingRepositories: [] });

	await watchStd(async () => {
		const stdin = mockStdin();

		// @ts-expect-error - Accessing protected method
		const promise = initProcess.selectRepository();

		await new Promise((res) => setTimeout(res, 50));

		// New repository
		stdin.send("\n");

		await new Promise((res) => setTimeout(res, 50));

		// domain, enter
		stdin.send(domain).send("\n").restore();

		return promise;
	});

	// @ts-expect-error - Accessing protected property
	expect(initProcess.context.repository).toStrictEqual({
		domain,
		exists: false,
	});
});

it("formats new repository name", async () => {
	const rawDomain = "New Repo";
	const domain = "new-repo";
	mockPrismicRepositoryManager(initProcess, { existingRepositories: [] });

	await watchStd(async () => {
		const stdin = mockStdin();

		// @ts-expect-error - Accessing protected method
		const promise = initProcess.selectRepository();

		await new Promise((res) => setTimeout(res, 50));

		// New repository
		stdin.send("\n");

		await new Promise((res) => setTimeout(res, 50));

		// domain, enter
		stdin.send(rawDomain).send("\n").restore();

		return promise;
	});

	// @ts-expect-error - Accessing protected property
	expect(initProcess.context.repository).toStrictEqual({
		domain,
		exists: false,
	});
});

it("checks for new repository name to be long enough", async () => {
	const shortDomain = "s";
	const domain = "new-repo";
	mockPrismicRepositoryManager(initProcess, {
		existingRepositories: [],
	});

	await watchStd(async () => {
		const stdin = mockStdin();

		// @ts-expect-error - Accessing protected method
		const promise = initProcess.selectRepository();

		await new Promise((res) => setTimeout(res, 50));

		// New repository
		stdin.send("\n");

		await new Promise((res) => setTimeout(res, 50));

		// short domain, enter
		stdin.send(shortDomain).send("\n");

		await new Promise((res) => setTimeout(res, 50));
		// clear, domain, enter
		stdin
			.send("\b".repeat(shortDomain.length))
			.send(domain)
			.send("\n")
			.restore();

		return promise;
	});

	// @ts-expect-error - Accessing protected property
	expect(initProcess.context.repository).toStrictEqual({
		domain,
		exists: false,
	});
});

it("checks for new repository name to be short enough", async () => {
	const longDomain =
		"lorem-ipsum-dolor-sit-amet-consectetur-adipisicing-elit-Officiis-incidunt-ex-harum";
	const domain = "new-repo";
	mockPrismicRepositoryManager(initProcess, {
		existingRepositories: [],
	});

	await watchStd(async () => {
		const stdin = mockStdin();

		// @ts-expect-error - Accessing protected method
		const promise = initProcess.selectRepository();

		await new Promise((res) => setTimeout(res, 50));

		// New repository
		stdin.send("\n");

		await new Promise((res) => setTimeout(res, 50));

		// long domain, enter
		stdin.send(longDomain).send("\n");

		await new Promise((res) => setTimeout(res, 50));
		// clear, domain, enter
		stdin
			.send("\b".repeat(longDomain.length))
			.send(domain)
			.send("\n")
			.restore();

		return promise;
	});

	// @ts-expect-error - Accessing protected property
	expect(initProcess.context.repository).toStrictEqual({
		domain,
		exists: false,
	});
});

it("checks for new repository name to be available", async () => {
	const existingDomain = "existing-repo";
	const domain = "new-repo";
	const prismicRepositorySpy = mockPrismicRepositoryManager(initProcess, {
		existingRepositories: [existingDomain],
	});

	await watchStd(async () => {
		const stdin = mockStdin();

		// @ts-expect-error - Accessing protected method
		const promise = initProcess.selectRepository();

		await new Promise((res) => setTimeout(res, 50));

		// New repository
		stdin.send("\n");

		await new Promise((res) => setTimeout(res, 50));

		// existing domain, enter
		stdin.send(existingDomain).send("\n");

		await new Promise((res) => setTimeout(res, 50));
		// clear, domain, enter
		stdin
			.send("\b".repeat(existingDomain.length))
			.send(domain)
			.send("\n")
			.restore();

		return promise;
	});

	expect(prismicRepositorySpy.checkExists).toHaveBeenCalledWith({
		domain: existingDomain,
	});
	expect(prismicRepositorySpy.checkExists).toHaveBeenCalledWith({
		domain,
	});
	// @ts-expect-error - Accessing protected property
	expect(initProcess.context.repository).toStrictEqual({
		domain,
		exists: false,
	});
});

it("suggests new repository name based on package.json first", async () => {
	mockPrismicRepositoryManager(initProcess, { existingRepositories: [] });

	await watchStd(async () => {
		const stdin = mockStdin();

		// @ts-expect-error - Accessing protected method
		const promise = initProcess.selectRepository();

		await new Promise((res) => setTimeout(res, 50));

		// New repository
		stdin.send("\n");

		await new Promise((res) => setTimeout(res, 50));

		// Suggested name
		stdin.send("\n").restore();

		return promise;
	});

	// @ts-expect-error - Accessing protected property
	expect(initProcess.context.repository).toMatchInlineSnapshot(`
		{
		  "domain": "package-base",
		  "exists": false,
		}
	`);
});

it("suggests new repository name based on directory name second", async () => {
	mockPrismicRepositoryManager(initProcess, {
		existingRepositories: ["package-base"],
	});

	await watchStd(async () => {
		const stdin = mockStdin();

		// @ts-expect-error - Accessing protected method
		const promise = initProcess.selectRepository();

		await new Promise((res) => setTimeout(res, 50));

		// New repository
		stdin.send("\n");

		await new Promise((res) => setTimeout(res, 50));

		// Suggested name
		stdin.send("\n").restore();

		return promise;
	});

	// @ts-expect-error - Accessing protected property
	expect(initProcess.context.repository).toMatchInlineSnapshot(`
		{
		  "domain": "base",
		  "exists": false,
		}
	`);
});

it("suggests new repository name based on random third", async () => {
	mockPrismicRepositoryManager(initProcess, {
		existingRepositories: ["package-base", "base"],
	});

	await watchStd(async () => {
		const stdin = mockStdin();

		// @ts-expect-error - Accessing protected method
		const promise = initProcess.selectRepository();

		await new Promise((res) => setTimeout(res, 50));

		// New repository
		stdin.send("\n");

		await new Promise((res) => setTimeout(res, 50));

		// Suggested name
		stdin.send("\n").restore();

		return promise;
	});

	// @ts-expect-error - Accessing protected property
	expect(initProcess.context.repository?.domain.split("-")).toStrictEqual([
		expect.any(String),
		expect.any(String),
		expect.any(String),
	]);
	// @ts-expect-error - Accessing protected property
	expect(initProcess.context.repository?.exists).toBe(false);
});

it("automatically enters new repository name selection if user doesn't have any repository", async () => {
	const domain = "new-repo";
	updateContext(initProcess, { userRepositories: [] });
	mockPrismicRepositoryManager(initProcess, { existingRepositories: [] });

	await watchStd(async () => {
		const stdin = mockStdin();

		// @ts-expect-error - Accessing protected method
		const promise = initProcess.selectRepository();

		await new Promise((res) => setTimeout(res, 50));

		// domain, enter
		stdin.send(domain).send("\n").restore();

		return promise;
	});

	// @ts-expect-error - Accessing protected property
	expect(initProcess.context.repository).toStrictEqual({
		domain,
		exists: false,
	});
});

it("doesn't throw if package could not be read to suggest new repository name", async () => {
	const initProcess = createSliceMachineInitProcess({
		cwd: path.resolve(__dirname, "__fixtures__/emptyPkg"),
	});
	setContext(initProcess, { userRepositories: [] });

	mockPrismicRepositoryManager(initProcess, { existingRepositories: [] });

	await watchStd(async () => {
		const stdin = mockStdin();

		// @ts-expect-error - Accessing protected method
		const promise = initProcess.selectRepository();

		await new Promise((res) => setTimeout(res, 50));

		// New repository
		stdin.send("\n");

		await new Promise((res) => setTimeout(res, 50));

		// Suggested name
		stdin.send("\n").restore();

		return promise;
	});

	// @ts-expect-error - Accessing protected property
	expect(initProcess.context.repository).toMatchInlineSnapshot(`
		{
		  "domain": "emptypkg",
		  "exists": false,
		}
	`);
});

it("throws if context is missing user repositories", async () => {
	updateContext(initProcess, {
		userRepositories: undefined,
	});

	await expect(
		watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.selectRepository();
		}),
	).rejects.toThrowErrorMatchingInlineSnapshot(
		'"User repositories must be available through context to run `selectRepository`"',
	);
});
