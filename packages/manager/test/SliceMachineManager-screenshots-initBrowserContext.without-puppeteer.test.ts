import { expect, it, vi } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

vi.mock("puppeteer", () => {
	throw new Error("forced failure");
});

it("throws if Puppeteer is not importable (e.g. not installed)", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await expect(async () => {
		await manager.screenshots.initBrowserContext();
	}).rejects.toThrow(/puppeteer was not found/i);
});
