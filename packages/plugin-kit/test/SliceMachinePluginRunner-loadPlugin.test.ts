import { it, expect, vi } from "vitest";
import * as path from "node:path";

import * as adapter from "./__fixtures__/adapter";
import * as plugin from "./__fixtures__/plugin";
import { createSliceMachineProject } from "./__testutils__/createSliceMachineProject";

import { createSliceMachinePluginRunner } from "../src";

const project = createSliceMachineProject(adapter.valid);
const pluginRunner = createSliceMachinePluginRunner({ project });

const createRequireMock =
	vi.fn<Parameters<typeof import("node:module")["createRequire"]>>();

type MockCreateRequireForProjectArgs = {
	moduleID: string;
	module: unknown;
};
const mockCreateRequireForProjectOnce = (
	args: MockCreateRequireForProjectArgs,
) => {
	createRequireMock.mockImplementationOnce((filename) => {
		if (
			typeof filename === "string" &&
			path.dirname(filename) === project.root
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

vi.mock("module", async () => {
	const actual: typeof import("node:module") = await vi.importActual(
		"node:module",
	);

	return {
		...actual,
		createRequire: (...args: Parameters<typeof actual["createRequire"]>) => {
			const res = createRequireMock(...args);

			if (res !== undefined) {
				return res;
			} else {
				return actual.createRequire(...args);
			}
		},
	};
});

it("loads plugin from node_modules", async () => {
	mockCreateRequireForProjectOnce({
		moduleID: plugin.valid.meta.name,
		module: plugin.valid,
	});

	// @ts-expect-error - Calling private method
	const loadedPlugin = await pluginRunner._loadPlugin(plugin.valid.meta.name);

	expect(loadedPlugin).toStrictEqual({
		meta: plugin.valid.meta,
		resolve: plugin.valid.meta.name,
		setup: plugin.valid.setup,
		options: {},
	});
});

it("loads plugin from node_modules with options", async () => {
	mockCreateRequireForProjectOnce({
		moduleID: plugin.valid.meta.name,
		module: plugin.valid,
	});

	const options = { foo: "bar" };

	// @ts-expect-error - Calling private method
	const loadedPlugin = await pluginRunner._loadPlugin({
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

it("loads plugin from direct definition", async () => {
	// @ts-expect-error - Calling private method
	const loadedPlugin = await pluginRunner._loadPlugin(plugin.valid);

	expect(loadedPlugin).toStrictEqual({
		meta: plugin.valid.meta,
		resolve: plugin.valid,
		setup: plugin.valid.setup,
		options: {},
	});
});

it("loads plugin from direct definition with options", async () => {
	const options = { foo: "bar" };

	// @ts-expect-error - Calling private method
	const loadedPlugin = await pluginRunner._loadPlugin({
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
	const nonExistentModuleName = ctx.meta.name;

	await expect(
		// @ts-expect-error - Calling private method
		pluginRunner._loadPlugin(nonExistentModuleName),
	).rejects.toThrowError(/could not resolve plugin/i);
});
