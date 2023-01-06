import * as path from "node:path";

import { beforeEach, expect, it } from "vitest";

import { createSliceMachineInitProcess } from "../src";
import { UNIVERSAL } from "../src/lib/framework";

import { mockPrismicRepositoryManager } from "./__testutils__/mockPrismicRepositoryManager";
import { setContext } from "./__testutils__/setContext";
import { updateContext } from "./__testutils__/updateContext";
import { watchStd } from "./__testutils__/watchStd";

const initProcess = createSliceMachineInitProcess({
	cwd: path.resolve(__dirname, "__fixtures__/base"),
});

beforeEach(() => {
	setContext(initProcess, {
		framework: UNIVERSAL,
		repository: {
			domain: "new-repo",
			exists: false,
		},
	});
});

it("creates repository from context", async () => {
	const prismicRepositoryManagerSpy = mockPrismicRepositoryManager(initProcess);

	await watchStd(async () => {
		// @ts-expect-error - Accessing protected method
		return initProcess.createNewRepository();
	});

	expect(prismicRepositoryManagerSpy.create).toHaveBeenCalledOnce();
	expect(prismicRepositoryManagerSpy.create).toHaveBeenNthCalledWith(1, {
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
