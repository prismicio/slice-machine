import { it, expect, vi, TestContext } from "vitest";
import * as path from "node:path";

import * as plugin from "./__fixtures__/plugin";

const createRequireMock =
	vi.fn<Parameters<typeof import("node:module")["createRequire"]>>();

vi.mock("module", async () => {
	const actual: typeof import("node:module") = await vi.importActual(
		"node:module",
	);

	return {
		...actual,
		createRequire: (...args: Parameters<(typeof actual)["createRequire"]>) => {
			try {
				const res = createRequireMock(...args);

				if (res !== undefined) {
					return res;
				}
			} catch {
				// noop - we tried to mock at least.
			}

			return actual.createRequire(...args);
		},
	};
});

type MockCreateRequireForProjectArgs = {
	moduleID: string;
	module: unknown;
};
const mockCreateRequireForProjectOnce = (
	ctx: TestContext,
	args: MockCreateRequireForProjectArgs,
) => {
	createRequireMock.mockImplementationOnce((filename) => {
		if (
			typeof filename === "string" &&
			path.dirname(filename) === path.resolve(ctx.project.root)
		) {
			return (moduleID: string) => {
				if (moduleID === args.moduleID) {
					return args.module;
				}
			};
		}

		throw new Error("not implemented");
	});
};

it("loads plugin from node_modules", async (ctx) => {
	mockCreateRequireForProjectOnce(ctx, {
		moduleID: plugin.valid.meta.name,
		module: plugin.valid,
	});

	// @ts-expect-error - Calling private method
	const loadedPlugin = await ctx.pluginRunner._loadPlugin(
		plugin.valid.meta.name,
	);

	expect(loadedPlugin).toStrictEqual({
		meta: plugin.valid.meta,
		resolve: plugin.valid.meta.name,
		setup: plugin.valid.setup,
		options: {},
	});
});

it("loads plugin from node_modules with options", async (ctx) => {
	mockCreateRequireForProjectOnce(ctx, {
		moduleID: plugin.valid.meta.name,
		module: plugin.valid,
	});

	const options = { foo: "bar" };

	// @ts-expect-error - Calling private method
	const loadedPlugin = await ctx.pluginRunner._loadPlugin({
		resolve: plugin.valid.meta.name,
		options,
	});

	expect(loadedPlugin).toStrictEqual({
		meta: plugin.valid.meta,
		resolve: plugin.valid.meta.name,
		setup: plugin.valid.setup,
		options,
	});
});

it("loads plugin from direct definition", async (ctx) => {
	// @ts-expect-error - Calling private method
	const loadedPlugin = await ctx.pluginRunner._loadPlugin(plugin.valid);

	expect(loadedPlugin).toStrictEqual({
		meta: plugin.valid.meta,
		resolve: plugin.valid,
		setup: plugin.valid.setup,
		options: {},
	});
});

it("loads plugin from direct definition with options", async (ctx) => {
	const options = { foo: "bar" };

	// @ts-expect-error - Calling private method
	const loadedPlugin = await ctx.pluginRunner._loadPlugin({
		resolve: plugin.valid,
		options: { foo: "bar" },
	});

	expect(loadedPlugin).toStrictEqual({
		meta: plugin.valid.meta,
		resolve: plugin.valid,
		setup: plugin.valid.setup,
		options,
	});
});

it("throws when plugin could not be loaded", async (ctx) => {
	const nonExistentModuleName = ctx.task.name;

	await expect(
		// @ts-expect-error - Calling private method
		ctx.pluginRunner._loadPlugin(nonExistentModuleName),
	).rejects.toThrowError(/could not resolve plugin/i);
});
