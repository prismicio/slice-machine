import { describe, expect, it, vi } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { expectHookHandlerToHaveBeenCalledWithData } from "./__testutils__/expectHookHandlerToHaveBeenCalledWithData";

import { createSliceMachineManager } from "../src";
import {
	updateCustomTypeContentRelationships,
	updateSharedSliceContentRelationships,
} from "../src/managers/customTypes/CustomTypesManager";
import { SharedSlice } from "@prismicio/types-internal";

it("calls plugins' `custom-type:update` hook", async (ctx) => {
	const model = ctx.mockPrismic.model.customType();
	const hookHandler = vi.fn();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("custom-type:update", hookHandler);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.customTypes.updateCustomType({ model });

	expectHookHandlerToHaveBeenCalledWithData(hookHandler, { model });
	expect(res).toStrictEqual({
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

it("throws if plugins have not been initialized", async (ctx) => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	await expect(async () => {
		await manager.customTypes.updateCustomType({
			model: ctx.mockPrismic.model.customType(),
		});
	}).rejects.toThrow(/plugins have not been initialized/i);
});

describe("updateCustomTypeContentRelationships", () => {
	it("should update content relationship ids", async (ctx) => {
		const getOneLevelCrModel = (...ids: string[]) => {
			return ctx.mockPrismic.model.customType({
				format: "custom",
				label: "Test CT",
				repeatable: false,
				status: true,
				id: "testCt",
				fields: {
					name: {
						type: "Text",
						config: { label: "Name", placeholder: "Type name" },
					},
					authorDetails: {
						type: "Link",
						config: {
							label: "Author Details",
							placeholder: "Select author",
							select: "document",
							customtypes: [
								{
									id: "author",
									fields: ["authorFirstName", ...ids],
								},
							],
						},
					},
				},
			});
		};

		const onUpdate = vi.fn();
		updateCustomTypeContentRelationships({
			models: [
				{ model: getOneLevelCrModel("authorLastName") },
				{ model: getOneLevelCrModel("address") },
				{ model: getOneLevelCrModel("address", "authorLastName") },
			],
			previousPath: ["author", "authorLastName"],
			newPath: ["author", "authorLastName_CHANGED"],
			onUpdate,
		});

		expect(onUpdate).toHaveBeenCalledTimes(3);
		expect(onUpdate).toHaveBeenCalledWith(
			getOneLevelCrModel("authorLastName_CHANGED"),
		); // changed
		expect(onUpdate).toHaveBeenCalledWith(getOneLevelCrModel("address")); // not changed
		expect(onUpdate).toHaveBeenCalledWith(
			getOneLevelCrModel("address", "authorLastName_CHANGED"),
		); // changed
	});

	it("should update NESTED content relationship ids", async (ctx) => {
		const getTwoLevelCrModel = (args?: { crId?: string; ids?: string[] }) => {
			const { crId, ids } = args ?? {};

			return ctx.mockPrismic.model.customType({
				format: "custom",
				label: "Test CT",
				repeatable: false,
				status: true,
				id: "testCt",
				fields: {
					name: {
						type: "Text",
						config: { label: "Name", placeholder: "Type name" },
					},
					authorDetails: {
						type: "Link",
						config: {
							label: "Author Details",
							placeholder: "Select author",
							select: "document",
							customtypes: [
								{
									id: "author",
									fields: [
										"authorFirstName",
										{
											id: crId ?? "address_cr",
											customtypes: [
												{
													id: "address",
													fields: ["country", ...(ids ?? [])],
												},
											],
										},
									],
								},
							],
						},
					},
				},
			});
		};

		const onUpdate = vi.fn();
		updateCustomTypeContentRelationships({
			models: [
				{ model: getTwoLevelCrModel({ ids: ["city"] }) },
				{ model: getTwoLevelCrModel({ ids: ["addressLine1"] }) },
				{ model: getTwoLevelCrModel({ ids: ["addressLine1", "city"] }) },
			],
			previousPath: ["address", "city"],
			newPath: ["address", "city_CHANGED"],
			onUpdate,
		});

		expect(onUpdate).toHaveBeenCalledWith(
			getTwoLevelCrModel({ ids: ["city_CHANGED"] }),
		); // changed
		expect(onUpdate).toHaveBeenCalledWith(
			getTwoLevelCrModel({ ids: ["addressLine1"] }),
		); // not changed
		expect(onUpdate).toHaveBeenCalledWith(
			getTwoLevelCrModel({ ids: ["addressLine1", "city_CHANGED"] }),
		); // changed

		updateCustomTypeContentRelationships({
			models: [{ model: getTwoLevelCrModel() }],
			previousPath: ["author", "address_cr"],
			newPath: ["author", "address_cr_CHANGED"],
			onUpdate,
		});

		expect(onUpdate).toHaveBeenCalledWith(
			getTwoLevelCrModel({ crId: "address_cr_CHANGED" }),
		); // changed
	});
});

describe("updateSharedSliceContentRelationships", () => {
	it("should update slice content relationship ids", async () => {
		const getOneLevelSharedSliceModel = (...ids: string[]): SharedSlice => {
			return {
				id: "testSlice",
				name: "Test Slice",
				type: "SharedSlice",
				description: "Test Slice",
				variations: [
					{
						id: "testVariation",
						name: "Test Variation",
						description: "Test Variation",
						version: "1.0.0",
						docURL: "https://www.prismic.io",
						imageUrl: "https://www.prismic.io",
						primary: {
							name: {
								type: "Text",
								config: { label: "Name", placeholder: "Type name" },
							},
							authorDetails: {
								type: "Link",
								config: {
									label: "Author Details",
									placeholder: "Select author",
									select: "document",
									customtypes: [
										{
											id: "author",
											fields: ["authorFirstName", ...ids],
										},
									],
								},
							},
						},
					},
				],
			};
		};

		const onUpdate = vi.fn();
		updateSharedSliceContentRelationships({
			models: [
				{ model: getOneLevelSharedSliceModel("authorLastName") },
				{ model: getOneLevelSharedSliceModel("address") },
				{ model: getOneLevelSharedSliceModel("address", "authorLastName") },
			],
			previousPath: ["author", "authorLastName"],
			newPath: ["author", "authorLastName_CHANGED"],
			onUpdate,
		});

		expect(onUpdate).toHaveBeenCalledTimes(3);
		expect(onUpdate).toHaveBeenCalledWith(
			getOneLevelSharedSliceModel("authorLastName_CHANGED"),
		); // changed
		expect(onUpdate).toHaveBeenCalledWith(
			getOneLevelSharedSliceModel("address"),
		); // not changed
		expect(onUpdate).toHaveBeenCalledWith(
			getOneLevelSharedSliceModel("address", "authorLastName_CHANGED"),
		); // changed
	});

	it("should update slice NESTED content relationship ids", async () => {
		const getTwoLevelSharedSliceModel = (args?: {
			crId?: string;
			ids?: string[];
		}): SharedSlice => {
			const { crId, ids } = args ?? {};

			return {
				id: "testSlice",
				name: "Test Slice",
				type: "SharedSlice",
				description: "Test Slice",
				variations: [
					{
						id: "testVariation",
						name: "Test Variation",
						description: "Test Variation",
						version: "1.0.0",
						docURL: "https://www.prismic.io",
						imageUrl: "https://www.prismic.io",
						primary: {
							name: {
								type: "Text",
								config: { label: "Name", placeholder: "Type name" },
							},
							authorDetails: {
								type: "Link",
								config: {
									label: "Author Details",
									placeholder: "Select author",
									select: "document",
									customtypes: [
										{
											id: "author",
											fields: [
												"authorFirstName",
												{
													id: crId ?? "address_cr",
													customtypes: [
														{
															id: "address",
															fields: ["country", ...(ids ?? [])],
														},
													],
												},
											],
										},
									],
								},
							},
						},
					},
				],
			};
		};

		const onUpdate = vi.fn();
		updateSharedSliceContentRelationships({
			models: [
				{ model: getTwoLevelSharedSliceModel({ ids: ["city"] }) },
				{ model: getTwoLevelSharedSliceModel({ ids: ["addressLine1"] }) },
				{
					model: getTwoLevelSharedSliceModel({ ids: ["addressLine1", "city"] }),
				},
			],
			previousPath: ["address", "city"],
			newPath: ["address", "city_CHANGED"],
			onUpdate,
		});

		expect(onUpdate).toHaveBeenCalledTimes(3);
		expect(onUpdate).toHaveBeenCalledWith(
			getTwoLevelSharedSliceModel({ ids: ["city_CHANGED"] }),
		); // changed
		expect(onUpdate).toHaveBeenCalledWith(
			getTwoLevelSharedSliceModel({ ids: ["addressLine1"] }),
		); // not changed
		expect(onUpdate).toHaveBeenCalledWith(
			getTwoLevelSharedSliceModel({ ids: ["addressLine1", "city_CHANGED"] }),
		); // changed

		updateSharedSliceContentRelationships({
			models: [{ model: getTwoLevelSharedSliceModel() }],
			previousPath: ["author", "address_cr"],
			newPath: ["author", "address_cr_CHANGED"],
			onUpdate,
		});

		expect(onUpdate).toHaveBeenCalledWith(
			getTwoLevelSharedSliceModel({ crId: "address_cr_CHANGED" }),
		); // changed
	});
});
