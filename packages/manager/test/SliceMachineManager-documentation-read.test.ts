import { expect, it, vi } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

const mockedDocumentation = { label: "My label", content: "" };

it("calls plugins' `slice:create` hook", async (ctx) => {
	const model = ctx.mockPrismic.model.customType();
	const hookHandler = vi.fn(() => {
		return [mockedDocumentation];
	});
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("documentation:read", hookHandler);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = manager.documentation.read({
		kind: "PageSnippet",
		data: { model },
	});

	expect(res).toStrictEqual({
		documentation: mockedDocumentation,
		errors: [],
	});
});

it("throws if plugins have not been initialized", async (ctx) => {
	const cwd = await createTestProject();
	const model = ctx.mockPrismic.model.customType();
	const manager = createSliceMachineManager({ cwd });

	await expect(async () => {
		manager.documentation.read({
			kind: "PageSnippet",
			data: { model },
		});
	}).rejects.toThrow(/plugins have not been initialized/i);
});
