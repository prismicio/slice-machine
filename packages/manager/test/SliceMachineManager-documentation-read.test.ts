import { expect, it, vi } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

const mockedDocumentation = { label: "My label", content: "" };

it("calls plugins' `documentation:read` hook", async (ctx) => {
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

	const res = await manager.documentation.read({
		kind: "PageSnippet",
		data: { model },
	});

	expect(res).toStrictEqual({
		documentation: [mockedDocumentation],
		errors: [],
	});
});

it("returns empty array if no documentation exists", async (ctx) => {
	const model = ctx.mockPrismic.model.customType();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("custom-type:read", () => {
				return { model };
			});
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.documentation.read({
		kind: "PageSnippet",
		data: { model },
	});

	expect(res).toStrictEqual({
		documentation: [],
		errors: [],
	});
});
