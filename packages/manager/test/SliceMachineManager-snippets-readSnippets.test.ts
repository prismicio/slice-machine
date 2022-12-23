import { expect, it, vi } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { expectHookHandlerToHaveBeenCalledWithData } from "./__testutils__/expectHookHandlerToHaveBeenCalledWithData";

import { createSliceMachineManager } from "../src";

it("calls plugins' `snippet:read` hook", async (ctx) => {
	const model = ctx.mockPrismic.model.link();
	const hookHandler = vi.fn(() => {
		return {
			label: "foo",
			language: "markdown",
			code: "[text](href)",
		};
	});
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("snippet:read", hookHandler);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.snippets.readSnippets({
		fieldPath: ["foo", "bar", "baz"],
		model,
	});

	expectHookHandlerToHaveBeenCalledWithData(hookHandler, {
		fieldPath: ["foo", "bar", "baz"],
		model,
	});
	expect(res).toStrictEqual({
		snippets: [
			{
				label: "foo",
				language: "markdown",
				code: "[text](href)",
			},
		],
		errors: [],
	});
});

it("flattens snippets into a single array", async (ctx) => {
	const model = ctx.mockPrismic.model.link();
	const hookHandler = vi.fn(() => {
		return [
			{
				label: "foo",
				language: "markdown",
				code: "[text](href)",
			},
			{
				label: "bar",
				language: "html",
				code: '<a href="href">text</a>',
			},
		];
	});
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("snippet:read", hookHandler);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.snippets.readSnippets({
		fieldPath: ["foo", "bar", "baz"],
		model,
	});

	expectHookHandlerToHaveBeenCalledWithData(hookHandler, {
		fieldPath: ["foo", "bar", "baz"],
		model,
	});
	expect(res).toStrictEqual({
		snippets: [
			{
				label: "foo",
				language: "markdown",
				code: "[text](href)",
			},
			{
				label: "bar",
				language: "html",
				code: '<a href="href">text</a>',
			},
		],
		errors: [],
	});
});

it("throws if plugins have not been initialized", async (ctx) => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	await expect(async () => {
		await manager.customTypes.updateCustomType({
			model: ctx.mockPrismic.model.customType(),
		});
	}).rejects.toThrow(/plugins have not been initialized/i);
});
