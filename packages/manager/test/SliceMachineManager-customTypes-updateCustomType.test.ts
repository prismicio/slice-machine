import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { expectHookHandlerToHaveBeenCalledWithData } from "./__testutils__/expectHookHandlerToHaveBeenCalledWithData";

import { createSliceMachineManager } from "../src";
import {
	updateCustomTypeContentRelationships,
	updateSharedSliceContentRelationships,
} from "../src/managers/customTypes/CustomTypesManager";
import {
	SharedSlice,
	CustomType,
	LinkConfig,
} from "@prismicio/types-internal/lib/customtypes";

it("calls plugins' `custom-type:update` hook", async (ctx) => {
	const model = ctx.mockPrismic.model.customType();
	const readHookHandler = vi.fn(() => ({
		model: ctx.mockPrismic.model.customType(),
		errors: [],
	}));
	const updateHookHandler = vi.fn();

	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("custom-type:read", readHookHandler);
			hook("custom-type:update", updateHookHandler);
		},
	});

	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.customTypes.updateCustomType({ model });

	expectHookHandlerToHaveBeenCalledWithData(updateHookHandler, { model });
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

function getMockModelFields(customtypes: LinkConfig["customtypes"] = []) {
	return {
		textField1: {
			type: "Text",
			config: { label: "Text Field 1" },
		},
		contentRelationshipField1: {
			type: "Link",
			config: {
				label: "Content Relationship Field 1",
				select: "document",
				customtypes,
			},
		},
	} as const satisfies CustomType["json"][keyof CustomType["json"]];
}

function getTestFn(type: "customType" | "sharedSlice") {
	return (args: {
		models: { model: CustomType | SharedSlice }[];
		onUpdate: (model: {
			previousModel: CustomType | SharedSlice;
			model: CustomType | SharedSlice;
		}) => void;
		previousPath: [string, string] | [string, string, string];
		newPath: [string, string] | [string, string, string];
	}) => {
		if (type === "customType") {
			updateCustomTypeContentRelationships(
				args as Parameters<typeof updateCustomTypeContentRelationships>[0],
			);
		} else {
			updateSharedSliceContentRelationships(
				args as Parameters<typeof updateSharedSliceContentRelationships>[0],
			);
		}
	};
}

const onUpdate = vi.fn();

describe.each([
	{
		name: "updateCustomTypeContentRelationships",
		updateContentRelationships: getTestFn("customType"),
		getModel: (customtypes: LinkConfig["customtypes"] = []): CustomType => {
			return {
				format: "custom",
				label: "Test Custom Type",
				repeatable: false,
				status: true,
				id: "testCustomType",
				json: {
					Main: getMockModelFields(customtypes),
				},
			};
		},
	},
	{
		name: "updateSharedSliceContentRelationships",
		updateContentRelationships: getTestFn("sharedSlice"),
		getModel: (customtypes: LinkConfig["customtypes"] = []): SharedSlice => {
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
						primary: getMockModelFields(customtypes),
					},
				],
			};
		},
	},
])("updateContentRelationships", (ctx) => {
	const { name, updateContentRelationships, getModel } = ctx;

	describe(name, () => {
		beforeEach(() => {
			vi.clearAllMocks();
		});

		it("should update content relationship ids", async () => {
			updateContentRelationships({
				models: [
					{ model: getModel([{ id: "author", fields: ["authorLastName"] }]) },
					{ model: getModel([{ id: "author", fields: ["address"] }]) },
					{
						model: getModel([
							{ id: "author", fields: ["authorLastName", "address"] },
						]),
					},
				],
				previousPath: ["author", "authorLastName"],
				newPath: ["author", "authorLastName_CHANGED"],
				onUpdate,
			});

			// less calls than models because onUpdate is only called if the model has changed
			expect(onUpdate).toHaveBeenCalledTimes(2);

			expect(onUpdate).toHaveBeenCalledWith({
				previousModel: getModel([{ id: "author", fields: ["authorLastName"] }]),
				model: getModel([{ id: "author", fields: ["authorLastName_CHANGED"] }]),
			});
			expect(onUpdate).toHaveBeenCalledWith({
				previousModel: getModel([
					{ id: "author", fields: ["authorLastName", "address"] },
				]),
				model: getModel([
					{ id: "author", fields: ["authorLastName_CHANGED", "address"] },
				]),
			});
		});

		it("should update the ids of fields inside a GROUP", async () => {
			updateContentRelationships({
				models: [
					{
						model: getModel([
							{
								id: "author",
								fields: [{ id: "languages", fields: ["shortCode"] }],
							},
						]),
					},
					{
						model: getModel([
							{
								id: "author",
								fields: [{ id: "languages", fields: ["flag"] }],
							},
						]),
					},
					{
						model: getModel([
							{
								id: "author",
								fields: [{ id: "languages", fields: ["shortCode", "flag"] }],
							},
						]),
					},
				],
				previousPath: ["author", "languages", "shortCode"],
				newPath: ["author", "languages", "shortCode_CHANGED"],
				onUpdate,
			});

			// less calls than models because onUpdate is only called if the model has changed
			expect(onUpdate).toHaveBeenCalledTimes(2);

			expect(onUpdate).toHaveBeenCalledWith({
				previousModel: getModel([
					{
						id: "author",
						fields: [{ id: "languages", fields: ["shortCode"] }],
					},
				]),
				model: getModel([
					{
						id: "author",
						fields: [{ id: "languages", fields: ["shortCode_CHANGED"] }],
					},
				]),
			});
			expect(onUpdate).toHaveBeenCalledWith({
				previousModel: getModel([
					{
						id: "author",
						fields: [{ id: "languages", fields: ["shortCode"] }],
					},
				]),
				model: getModel([
					{
						id: "author",
						fields: [{ id: "languages", fields: ["shortCode_CHANGED"] }],
					},
				]),
			});
		});

		it("should update the id of a GROUP", async () => {
			updateContentRelationships({
				models: [
					{
						model: getModel([
							{
								id: "author",
								fields: [{ id: "languages", fields: ["shortCode"] }],
							},
						]),
					},
				],
				previousPath: ["author", "languages"],
				newPath: ["author", "languages_CHANGED"],
				onUpdate,
			});

			expect(onUpdate).toHaveBeenCalledWith({
				previousModel: getModel([
					{
						id: "author",
						fields: [{ id: "languages", fields: ["shortCode"] }],
					},
				]),
				model: getModel([
					{
						id: "author",
						fields: [{ id: "languages_CHANGED", fields: ["shortCode"] }],
					},
				]),
			});
		});

		it("should update the ids of fields inside a GROUP along with the group id", async () => {
			updateContentRelationships({
				models: [
					{
						model: getModel([
							{
								id: "author",
								fields: [{ id: "languages", fields: ["shortCode"] }],
							},
						]),
					},
				],
				previousPath: ["author", "languages", "shortCode"],
				newPath: ["author", "languages_CHANGED", "shortCode_CHANGED"],
				onUpdate,
			});

			expect(onUpdate).toHaveBeenCalledTimes(1);

			expect(onUpdate).toHaveBeenCalledWith({
				previousModel: getModel([
					{
						id: "author",
						fields: [{ id: "languages", fields: ["shortCode"] }],
					},
				]),
				model: getModel([
					{
						id: "author",
						fields: [
							{ id: "languages_CHANGED", fields: ["shortCode_CHANGED"] },
						],
					},
				]),
			});
		});

		it("should update NESTED content relationship ids", async () => {
			updateContentRelationships({
				models: [
					{
						model: getModel([
							{
								id: "author",
								fields: [
									{
										id: "address_cr",
										customtypes: [{ id: "address", fields: ["city"] }],
									},
								],
							},
						]),
					},
					{
						model: getModel([
							{
								id: "author",
								fields: [
									{
										id: "address_cr",
										customtypes: [{ id: "address", fields: ["addressLine1"] }],
									},
								],
							},
						]),
					},
					{
						model: getModel([
							{
								id: "author",
								fields: [
									{
										id: "address_cr",
										customtypes: [
											{ id: "address", fields: ["city", "addressLine1"] },
										],
									},
								],
							},
						]),
					},
				],
				previousPath: ["address", "city"],
				newPath: ["address", "city_CHANGED"],
				onUpdate,
			});

			// less calls than models because onUpdate is only called if the model has changed
			expect(onUpdate).toHaveBeenCalledTimes(2);

			expect(onUpdate).toHaveBeenCalledWith({
				previousModel: getModel([
					{
						id: "author",
						fields: [
							{
								id: "address_cr",
								customtypes: [{ id: "address", fields: ["city"] }],
							},
						],
					},
				]),
				model: getModel([
					{
						id: "author",
						fields: [
							{
								id: "address_cr",
								customtypes: [{ id: "address", fields: ["city_CHANGED"] }],
							},
						],
					},
				]),
			});

			expect(onUpdate).toHaveBeenCalledWith({
				previousModel: getModel([
					{
						id: "author",
						fields: [
							{
								id: "address_cr",
								customtypes: [
									{ id: "address", fields: ["city", "addressLine1"] },
								],
							},
						],
					},
				]),
				model: getModel([
					{
						id: "author",
						fields: [
							{
								id: "address_cr",
								customtypes: [
									{ id: "address", fields: ["city_CHANGED", "addressLine1"] },
								],
							},
						],
					},
				]),
			});

			updateContentRelationships({
				models: [
					{
						model: getModel([
							{
								id: "author",
								fields: [
									{
										id: "address_cr",
										customtypes: [{ id: "address", fields: ["city"] }],
									},
								],
							},
						]),
					},
				],
				previousPath: ["author", "address_cr"],
				newPath: ["author", "address_cr_CHANGED"],
				onUpdate,
			});

			expect(onUpdate).toHaveBeenCalledWith({
				previousModel: getModel([
					{
						id: "author",
						fields: [
							{
								id: "address_cr",
								customtypes: [{ id: "address", fields: ["city"] }],
							},
						],
					},
				]),
				model: getModel([
					{
						id: "author",
						fields: [
							{
								id: "address_cr_CHANGED",
								customtypes: [{ id: "address", fields: ["city"] }],
							},
						],
					},
				]),
			});
		});

		it("should update NESTED GROUP field ids", async () => {
			updateContentRelationships({
				models: [
					{
						model: getModel([
							{
								id: "author",
								fields: [
									{
										id: "address_cr",
										customtypes: [
											{
												id: "address",
												fields: [
													"country",
													{ id: "contactDetails", fields: ["phone"] },
												],
											},
										],
									},
								],
							},
						]),
					},
					{
						model: getModel([
							{
								id: "author",
								fields: [
									{
										id: "address_cr",
										customtypes: [
											{
												id: "address",
												fields: [
													"country",
													{ id: "contactDetails", fields: ["email"] },
												],
											},
										],
									},
								],
							},
						]),
					},
					{
						model: getModel([
							{
								id: "author",
								fields: [
									{
										id: "address_cr",
										customtypes: [
											{
												id: "address",
												fields: [
													"country",
													{ id: "contactDetails", fields: ["phone", "email"] },
												],
											},
										],
									},
								],
							},
						]),
					},
				],
				previousPath: ["address", "contactDetails", "phone"],
				newPath: ["address", "contactDetails", "phone_CHANGED"],
				onUpdate,
			});

			// less calls than models because onUpdate is only called if the model has changed
			expect(onUpdate).toHaveBeenCalledTimes(2);

			expect(onUpdate).toHaveBeenCalledWith({
				previousModel: getModel([
					{
						id: "author",
						fields: [
							{
								id: "address_cr",
								customtypes: [
									{
										id: "address",
										fields: [
											"country",
											{ id: "contactDetails", fields: ["phone"] },
										],
									},
								],
							},
						],
					},
				]),
				model: getModel([
					{
						id: "author",
						fields: [
							{
								id: "address_cr",
								customtypes: [
									{
										id: "address",
										fields: [
											"country",
											{ id: "contactDetails", fields: ["phone_CHANGED"] },
										],
									},
								],
							},
						],
					},
				]),
			});
			expect(onUpdate).toHaveBeenCalledWith({
				previousModel: getModel([
					{
						id: "author",
						fields: [
							{
								id: "address_cr",
								customtypes: [
									{
										id: "address",
										fields: [
											"country",
											{ id: "contactDetails", fields: ["phone", "email"] },
										],
									},
								],
							},
						],
					},
				]),
				model: getModel([
					{
						id: "author",
						fields: [
							{
								id: "address_cr",
								customtypes: [
									{
										id: "address",
										fields: [
											"country",
											{
												id: "contactDetails",
												fields: ["phone_CHANGED", "email"],
											},
										],
									},
								],
							},
						],
					},
				]),
			});

			updateContentRelationships({
				models: [
					{
						model: getModel([
							{
								id: "author",
								fields: [
									{
										id: "address_cr",
										customtypes: [
											{
												id: "address",
												fields: [
													"country",
													{ id: "contactDetails", fields: ["phone"] },
												],
											},
										],
									},
								],
							},
						]),
					},
				],
				previousPath: ["address", "contactDetails"],
				newPath: ["address", "contactDetails_CHANGED"],
				onUpdate,
			});

			expect(onUpdate).toHaveBeenCalledWith({
				previousModel: getModel([
					{
						id: "author",
						fields: [
							{
								id: "address_cr",
								customtypes: [
									{
										id: "address",
										fields: [
											"country",
											{ id: "contactDetails", fields: ["phone"] },
										],
									},
								],
							},
						],
					},
				]),
				model: getModel([
					{
						id: "author",
						fields: [
							{
								id: "address_cr",
								customtypes: [
									{
										id: "address",
										fields: [
											"country",
											{ id: "contactDetails_CHANGED", fields: ["phone"] },
										],
									},
								],
							},
						],
					},
				]),
			});
		});

		it("should not update anything if the ids don't match", async () => {
			// Wrong custom type id

			updateContentRelationships({
				models: [
					{
						model: getModel([{ id: "author", fields: ["authorLastName"] }]),
					},
					{
						model: getModel([
							{ id: "author", fields: ["authorLastName", "address"] },
						]),
					},
				],
				previousPath: ["author_WRONG", "authorLastName"],
				newPath: ["author_WRONG", "authorLastName_NEW"],
				onUpdate,
			});

			// Wrong field id

			updateContentRelationships({
				models: [
					{
						model: getModel([{ id: "author", fields: ["authorLastName"] }]),
					},
					{
						model: getModel([
							{ id: "author", fields: ["authorLastName", "address"] },
						]),
					},
				],
				previousPath: ["author", "authorLastName_WRONG"],
				newPath: ["author", "authorLastName_NEW"],
				onUpdate,
			});

			// Wrong group id

			updateContentRelationships({
				models: [
					{
						model: getModel([
							{
								id: "author",
								fields: [{ id: "languages", fields: ["shortCode"] }],
							},
						]),
					},
					{
						model: getModel([
							{
								id: "author",
								fields: [{ id: "languages", fields: ["shortCode", "flag"] }],
							},
						]),
					},
				],
				previousPath: ["author", "languages_WRONG", "shortCode"],
				newPath: ["author", "languages_NEW", "shortCode_NEW"],
				onUpdate,
			});

			// Wrong group field id

			updateContentRelationships({
				models: [
					{
						model: getModel([
							{
								id: "author",
								fields: [{ id: "languages", fields: ["shortCode"] }],
							},
						]),
					},
					{
						model: getModel([
							{
								id: "author",
								fields: [{ id: "languages", fields: ["shortCode", "flag"] }],
							},
						]),
					},
				],
				previousPath: ["author", "languages", "shortCode_WRONG"],
				newPath: ["author", "languages", "shortCode_NEW"],
				onUpdate,
			});

			expect(onUpdate).not.toHaveBeenCalled();
		});

		it("should throw if previousPath or newPath are invalid", async () => {
			expect(() => {
				return updateContentRelationships({
					models: [
						{
							model: getModel([{ id: "author", fields: ["authorLastName"] }]),
						},
					],
					previousPath: [] as unknown as [string, string],
					newPath: [] as unknown as [string, string],
					onUpdate: vi.fn(),
				});
			}).toThrow();
		});
	});
});
