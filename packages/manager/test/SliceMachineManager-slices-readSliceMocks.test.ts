import { expect, it, vi } from "vitest";
import { Buffer } from "node:buffer";
import { SharedSliceContent } from "@prismicio/types-internal/lib/content";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { expectHookHandlerToHaveBeenCalledWithData } from "./__testutils__/expectHookHandlerToHaveBeenCalledWithData";

import { createSliceMachineManager } from "../src";

const sliceMock: SharedSliceContent = {
	__TYPE__: "SharedSliceContent",
	variation: "foo",
	primary: {
		bar: {
			__TYPE__: "BooleanContent",
			value: true,
		},
	},
	items: [
		{
			__TYPE__: "GroupItemContent",
			value: [
				[
					"baz",
					{
						__TYPE__: "BooleanContent",
						value: false,
					},
				],
			],
		},
	],
};

it("returns a Slice's mocks", async () => {
	const mocks = [sliceMock];
	const hookHandler = vi.fn(() => {
		return { data: Buffer.from(JSON.stringify(mocks)) };
	});
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:asset:read", hookHandler);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.slices.readSliceMocks({
		libraryID: "foo",
		sliceID: "bar",
	});

	expect(res).toStrictEqual({
		mocks,
		errors: [],
	});
	expectHookHandlerToHaveBeenCalledWithData(hookHandler, {
		libraryID: "foo",
		sliceID: "bar",
		assetID: "mocks.json",
	});
});

it("ignores plugins that implement `slice:read:asset`", async () => {
	const mocks = [sliceMock];
	const ignoredMocks = [{ qux: "quux" }];
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:asset:read", () => {
				return { data: Buffer.from(JSON.stringify(mocks)) };
			});
		},
	});
	const plugin = createTestPlugin({
		meta: { name: "ignored-plugin" },
		setup: ({ hook }) => {
			hook("slice:asset:read", () => {
				return { data: Buffer.from(JSON.stringify(ignoredMocks)) };
			});
		},
	});
	const cwd = await createTestProject({ adapter, plugins: [plugin] });
	const manager = createSliceMachineManager({
		nativePlugins: {
			[adapter.meta.name]: adapter,
			[plugin.meta.name]: plugin,
		},
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.slices.readSliceMocks({
		libraryID: "foo",
		sliceID: "bar",
	});

	expect(res.mocks).toStrictEqual(mocks);
});

it("throws if plugins have not been initialized", async () => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	await expect(async () => {
		await manager.slices.readSliceMocks({
			libraryID: "foo",
			sliceID: "bar",
		});
	}).rejects.toThrow(/plugins have not been initialized/i);
});
