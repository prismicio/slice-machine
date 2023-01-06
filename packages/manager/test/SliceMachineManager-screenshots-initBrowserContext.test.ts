import { expect, it, vi } from "vitest";

import { createPuppeteerMock } from "./__testutils__/createPuppeteerMock";
import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

vi.mock("puppeteer", () => {
	return createPuppeteerMock();
});

it("creates a reusable browser context", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	// @ts-expect-error - Accessing an internal private property
	expect(manager.screenshots._browserContext).toBe(undefined);

	await manager.screenshots.initBrowserContext();

	// @ts-expect-error - Accessing an internal private property
	expect(manager.screenshots._browserContext).toStrictEqual(
		expect.objectContaining({
			newPage: expect.any(Function),
		}),
	);
});
