import { TestContext, expect, it, vi } from "vitest";

import {
	CompositeSlice,
	CustomType,
	SharedSliceRef,
} from "@prismicio/types-internal/lib/customtypes";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { expectHookHandlerToHaveBeenCalledWithData } from "./__testutils__/expectHookHandlerToHaveBeenCalledWithData";

import { createSliceMachineManager } from "../src";

const baseSrc = {
	customTypeID: "ct_foo",
	tabID: "Main",
	sliceZoneID: "sliceZone_bar",
	sliceID: "slice_qux",
};

const baseDest = {
	libraryID: "library_foo",
	sliceID: "slice_bar",
	variationName: "Default",
	variationID: "default",
};

const mockCustomType = ({
	ctx,
	model,
	src,
	extraSlices,
}: {
	ctx: TestContext;
	model: CompositeSlice;
	src: typeof baseSrc;
	extraSlices?: Record<string, SharedSliceRef | CompositeSlice>;
}): CustomType => {
	return ctx.mockPrismic.model.customType({
		id: src.customTypeID,
		fields: {
			[src.sliceZoneID]: ctx.mockPrismic.model.sliceZone({
				choices: { [src.sliceID]: model, ...extraSlices },
			}),
		},
	});
};

it("converts composite slice as a new shared slice", async (ctx) => {
	const model = ctx.mockPrismic.model.slice({
		nonRepeatFields: { foo: ctx.mockPrismic.model.keyText() },
		repeatFields: { bar: ctx.mockPrismic.model.keyText() },
	});
	const src = { ...baseSrc };
	const dest = { ...baseDest };
	const customType = mockCustomType({ ctx, model, src });

	const customTypeUpdateHookHandler = vi.fn();
	const sliceCreateHookHandler = vi.fn();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook(
				"custom-type:read",
				vi.fn().mockResolvedValue({ model: customType }),
			);
			hook("custom-type:update", customTypeUpdateHookHandler);
			hook("slice:read", vi.fn().mockResolvedValue({ error: [] }));
			hook("slice:create", sliceCreateHookHandler);
			hook("slice:asset:read", vi.fn());
			hook("slice:asset:update", vi.fn());
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.slices.convertLegacySliceToSharedSlice({
		model,
		src,
		dest,
	});

	expectHookHandlerToHaveBeenCalledWithData(sliceCreateHookHandler, {
		libraryID: dest.libraryID,
		model: expect.objectContaining({
			id: dest.sliceID,
			type: "SharedSlice",
			legacyPaths: {
				[`${src.customTypeID}::${src.sliceZoneID}::${src.sliceID}`]:
					dest.variationID,
			},
			variations: [
				expect.objectContaining({
					id: dest.variationID,
					primary: model["non-repeat"],
					items: model.repeat,
				}),
			],
		}),
	});
	expectHookHandlerToHaveBeenCalledWithData(customTypeUpdateHookHandler, {
		model: expect.objectContaining({
			id: src.customTypeID,
			json: {
				[src.tabID]: {
					[src.sliceZoneID]: expect.objectContaining({
						config: expect.objectContaining({
							choices: {
								[dest.sliceID]: {
									type: "SharedSlice",
								},
							},
						}),
					}),
				},
			},
		}),
	});
	expect(res).toStrictEqual({
		errors: [],
	});
});

it("converts composite slice as a new variation of an existing shared slice", async (ctx) => {
	const existingSharedSliceModel = ctx.mockPrismic.model.sharedSlice({
		variations: [ctx.mockPrismic.model.sharedSliceVariation()],
	});
	const model = ctx.mockPrismic.model.slice({
		nonRepeatFields: { foo: ctx.mockPrismic.model.keyText() },
		repeatFields: { bar: ctx.mockPrismic.model.keyText() },
	});
	const src = { ...baseSrc };
	const dest = { ...baseDest, sliceID: existingSharedSliceModel.id };
	const customType = mockCustomType({
		ctx,
		model,
		src,
		extraSlices: {
			[existingSharedSliceModel.id]: existingSharedSliceModel,
		},
	});

	const customTypeUpdateHookHandler = vi.fn();
	const sliceUpdateHookHandler = vi.fn();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook(
				"custom-type:read",
				vi.fn().mockResolvedValue({ model: customType }),
			);
			hook("custom-type:update", customTypeUpdateHookHandler);
			hook(
				"slice:read",
				vi.fn().mockResolvedValue({ model: existingSharedSliceModel }),
			);
			hook("slice:update", sliceUpdateHookHandler);
			hook("slice:asset:read", vi.fn());
			hook("slice:asset:update", vi.fn());
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.slices.convertLegacySliceToSharedSlice({
		model,
		src,
		dest,
	});

	expectHookHandlerToHaveBeenCalledWithData(sliceUpdateHookHandler, {
		libraryID: dest.libraryID,
		model: expect.objectContaining({
			...existingSharedSliceModel,
			legacyPaths: {
				[`${src.customTypeID}::${src.sliceZoneID}::${src.sliceID}`]:
					dest.variationID,
			},
			variations: [
				existingSharedSliceModel.variations[0],
				expect.objectContaining({
					id: dest.variationID,
					primary: model["non-repeat"],
					items: model.repeat,
				}),
			],
		}),
	});
	expectHookHandlerToHaveBeenCalledWithData(customTypeUpdateHookHandler, {
		model: expect.objectContaining({
			id: src.customTypeID,
			json: {
				[src.tabID]: {
					[src.sliceZoneID]: expect.objectContaining({
						config: expect.objectContaining({
							choices: {
								[dest.sliceID]: {
									type: "SharedSlice",
								},
							},
						}),
					}),
				},
			},
		}),
	});
	expect(res).toStrictEqual({
		errors: [],
	});
});

it("converts composite slice by merging it with an existing shared slice variation", async (ctx) => {
	const existingSharedSliceModel = ctx.mockPrismic.model.sharedSlice({
		variations: [
			ctx.mockPrismic.model.sharedSliceVariation({
				primaryFields: { foo: ctx.mockPrismic.model.keyText() },
				itemsFields: { bar: ctx.mockPrismic.model.keyText() },
			}),
		],
	});
	const model = ctx.mockPrismic.model.slice();
	const src = { ...baseSrc };
	const dest = {
		...baseDest,
		sliceID: existingSharedSliceModel.id,
		variationID: existingSharedSliceModel.variations[0].id,
	};
	const customType = mockCustomType({
		ctx,
		model,
		src,
		extraSlices: {
			[existingSharedSliceModel.id]: existingSharedSliceModel,
		},
	});

	const customTypeUpdateHookHandler = vi.fn();
	const sliceUpdateHookHandler = vi.fn();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook(
				"custom-type:read",
				vi.fn().mockResolvedValue({ model: customType }),
			);
			hook("custom-type:update", customTypeUpdateHookHandler);
			hook(
				"slice:read",
				vi.fn().mockResolvedValue({ model: existingSharedSliceModel }),
			);
			hook("slice:update", sliceUpdateHookHandler);
			hook("slice:asset:read", vi.fn());
			hook("slice:asset:update", vi.fn());
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.slices.convertLegacySliceToSharedSlice({
		model,
		src,
		dest,
	});

	expectHookHandlerToHaveBeenCalledWithData(sliceUpdateHookHandler, {
		libraryID: dest.libraryID,
		model: {
			...existingSharedSliceModel,
			legacyPaths: {
				[`${src.customTypeID}::${src.sliceZoneID}::${src.sliceID}`]:
					dest.variationID,
			},
			variations: [existingSharedSliceModel.variations[0]],
		},
	});
	expectHookHandlerToHaveBeenCalledWithData(customTypeUpdateHookHandler, {
		model: expect.objectContaining({
			id: src.customTypeID,
			json: {
				[src.tabID]: {
					[src.sliceZoneID]: expect.objectContaining({
						config: expect.objectContaining({
							choices: {
								[dest.sliceID]: {
									type: "SharedSlice",
								},
							},
						}),
					}),
				},
			},
		}),
	});
	expect(res).toStrictEqual({
		errors: [],
	});
});

it("throws if plugins have not been initialized", async (ctx) => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	await expect(async () => {
		await manager.slices.convertLegacySliceToSharedSlice({
			model: ctx.mockPrismic.model.slice(),
			src: baseSrc,
			dest: baseDest,
		});
	}).rejects.toThrow(/plugins have not been initialized/i);
});
