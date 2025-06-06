import { describe, expect, it, vi } from "vitest";

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

function getCustomTypeFields(args?: {
	crId?: string;
	ids?: string[];
	groupId?: string;
	groupIds?: string[];
	nestedCrId?: string;
	nestedGroupId?: string;
	nestedIds?: string[];
	nestedGroupIds?: string[];
}) {
	const {
		crId,
		ids,
		groupId,
		groupIds,
		nestedCrId,
		nestedGroupId,
		nestedIds,
		nestedGroupIds,
	} = args ?? {};

	return {
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
						id: crId ?? "author",
						fields: [
							"firstName",
							...(ids ?? []),
							{
								id: nestedCrId ?? "address_cr",
								customtypes: [
									{
										id: "address",
										fields: [
											"country",
											{
												id: nestedGroupId ?? "contactDetails",
												fields: ["name", ...(nestedGroupIds ?? [])],
											},
											...(nestedIds ?? []),
										],
									},
								],
							},
							{
								id: groupId ?? "languages",
								fields: ["code", ...(groupIds ?? [])],
							},
						],
					},
				],
			},
		},
	} as const satisfies CustomType["json"][keyof CustomType["json"]];
}

describe("updateCustomTypeContentRelationships", () => {
	function getCustomTypeModel(args?: {
		crId?: string;
		ids?: string[];
		groupId?: string;
		groupIds?: string[];
		nestedCrId?: string;
		nestedGroupId?: string;
		nestedIds?: string[];
		nestedGroupIds?: string[];
	}): CustomType {
		return {
			format: "custom",
			label: "Test CT",
			repeatable: false,
			status: true,
			id: "testCt",
			json: {
				Main: getCustomTypeFields(args),
			},
		};
	}

	it("should update content relationship ids", async () => {
		const onUpdate = vi.fn();
		updateCustomTypeContentRelationships({
			models: [
				{ model: getCustomTypeModel({ ids: ["authorLastName"] }) },
				{ model: getCustomTypeModel({ ids: ["address"] }) },
				{ model: getCustomTypeModel({ ids: ["address", "authorLastName"] }) },
			],
			previousPath: ["author", "authorLastName"],
			newPath: ["author", "authorLastName_CHANGED"],
			onUpdate,
		});

		// less calls than models because onUpdate is only called if the model has changed
		expect(onUpdate).toHaveBeenCalledTimes(2);

		expect(onUpdate).toHaveBeenCalledWith({
			previousModel: getCustomTypeModel({ ids: ["authorLastName"] }),
			model: getCustomTypeModel({ ids: ["authorLastName_CHANGED"] }),
		});
		expect(onUpdate).toHaveBeenCalledWith({
			previousModel: getCustomTypeModel({ ids: ["address", "authorLastName"] }),
			model: getCustomTypeModel({
				ids: ["address", "authorLastName_CHANGED"],
			}),
		});
	});

	it("should update GROUP field ids", async () => {
		const onUpdate = vi.fn();
		updateCustomTypeContentRelationships({
			models: [
				{ model: getCustomTypeModel({ groupIds: ["shortCode"] }) },
				{ model: getCustomTypeModel({ groupIds: ["flag"] }) },
				{ model: getCustomTypeModel({ groupIds: ["shortCode", "flag"] }) },
			],
			previousPath: ["author", "languages", "shortCode"],
			newPath: ["author", "languages", "shortCode_CHANGED"],
			onUpdate,
		});

		// less calls than models because onUpdate is only called if the model has changed
		expect(onUpdate).toHaveBeenCalledTimes(2);

		expect(onUpdate).toHaveBeenCalledWith({
			previousModel: getCustomTypeModel({ groupIds: ["shortCode"] }),
			model: getCustomTypeModel({ groupIds: ["shortCode_CHANGED"] }),
		});
		expect(onUpdate).toHaveBeenCalledWith({
			previousModel: getCustomTypeModel({
				groupIds: ["shortCode", "flag"],
			}),
			model: getCustomTypeModel({
				groupIds: ["shortCode_CHANGED", "flag"],
			}),
		});

		updateCustomTypeContentRelationships({
			models: [{ model: getCustomTypeModel() }],
			previousPath: ["author", "languages"],
			newPath: ["author", "languages_CHANGED"],
			onUpdate,
		});

		expect(onUpdate).toHaveBeenCalledWith({
			previousModel: getCustomTypeModel({ groupId: "languages" }),
			model: getCustomTypeModel({ groupId: "languages_CHANGED" }),
		}); // changed
	});

	it("should update NESTED content relationship ids", async () => {
		const onUpdate = vi.fn();
		updateCustomTypeContentRelationships({
			models: [
				{ model: getCustomTypeModel({ nestedIds: ["city"] }) },
				{ model: getCustomTypeModel({ nestedIds: ["addressLine1"] }) },
				{ model: getCustomTypeModel({ nestedIds: ["addressLine1", "city"] }) },
			],
			previousPath: ["address", "city"],
			newPath: ["address", "city_CHANGED"],
			onUpdate,
		});

		// less calls than models because onUpdate is only called if the model has changed
		expect(onUpdate).toHaveBeenCalledTimes(2);

		expect(onUpdate).toHaveBeenCalledWith({
			previousModel: getCustomTypeModel({ nestedIds: ["city"] }),
			model: getCustomTypeModel({ nestedIds: ["city_CHANGED"] }),
		});
		expect(onUpdate).toHaveBeenCalledWith({
			previousModel: getCustomTypeModel({
				nestedIds: ["addressLine1", "city"],
			}),
			model: getCustomTypeModel({
				nestedIds: ["addressLine1", "city_CHANGED"],
			}),
		});

		updateCustomTypeContentRelationships({
			models: [{ model: getCustomTypeModel() }],
			previousPath: ["author", "address_cr"],
			newPath: ["author", "address_cr_CHANGED"],
			onUpdate,
		});

		expect(onUpdate).toHaveBeenCalledWith({
			previousModel: getCustomTypeModel({ nestedCrId: "address_cr" }),
			model: getCustomTypeModel({ nestedCrId: "address_cr_CHANGED" }),
		}); // changed
	});

	it("should update NESTED GROUP field ids", async () => {
		const onUpdate = vi.fn();
		updateCustomTypeContentRelationships({
			models: [
				{ model: getCustomTypeModel({ nestedGroupIds: ["phone"] }) },
				{ model: getCustomTypeModel({ nestedGroupIds: ["email"] }) },
				{ model: getCustomTypeModel({ nestedGroupIds: ["phone", "email"] }) },
			],
			previousPath: ["address", "contactDetails", "phone"],
			newPath: ["address", "contactDetails", "phone_CHANGED"],
			onUpdate,
		});

		// less calls than models because onUpdate is only called if the model has changed
		expect(onUpdate).toHaveBeenCalledTimes(2);

		expect(onUpdate).toHaveBeenCalledWith({
			previousModel: getCustomTypeModel({ nestedGroupIds: ["phone"] }),
			model: getCustomTypeModel({ nestedGroupIds: ["phone_CHANGED"] }),
		});
		expect(onUpdate).toHaveBeenCalledWith({
			previousModel: getCustomTypeModel({
				nestedGroupIds: ["phone", "email"],
			}),
			model: getCustomTypeModel({
				nestedGroupIds: ["phone_CHANGED", "email"],
			}),
		});

		updateCustomTypeContentRelationships({
			models: [{ model: getCustomTypeModel() }],
			previousPath: ["address", "contactDetails"],
			newPath: ["address", "contactDetails_CHANGED"],
			onUpdate,
		});

		expect(onUpdate).toHaveBeenCalledWith({
			previousModel: getCustomTypeModel({ nestedGroupId: "contactDetails" }),
			model: getCustomTypeModel({ nestedGroupId: "contactDetails_CHANGED" }),
		}); // changed
	});

	it("should not update content relationship ids if the custom type id is not the same", async () => {
		const onUpdate = vi.fn();

		updateCustomTypeContentRelationships({
			models: [
				{
					model: getCustomTypeModel({
						ids: ["sameFieldName"],
						nestedIds: ["sameFieldName"],
					}),
				},
			],
			previousPath: ["differentCustomType", "sameFieldName"],
			newPath: ["differentCustomType", "sameFieldName_CHANGED"],
			onUpdate,
		});

		expect(onUpdate).not.toHaveBeenCalled();
	});

	it("should throw if there is no custom type of field id in previousPath and/or newPath", async () => {
		expect(() => {
			return updateCustomTypeContentRelationships({
				models: [{ model: getCustomTypeModel() }],
				previousPath: [],
				newPath: [],
				onUpdate: vi.fn(),
			});
		}).toThrow();
	});
});

describe("updateSharedSliceContentRelationships", () => {
	function getSharedSliceModel(args?: {
		crId?: string;
		ids?: string[];
		groupId?: string;
		groupIds?: string[];
		nestedCrId?: string;
		nestedGroupId?: string;
		nestedIds?: string[];
		nestedGroupIds?: string[];
	}): SharedSlice {
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
					primary: getCustomTypeFields(args),
				},
			],
		};
	}

	it("should update slice content relationship ids", async () => {
		const onUpdate = vi.fn();
		updateSharedSliceContentRelationships({
			models: [
				{ model: getSharedSliceModel({ ids: ["authorLastName"] }) },
				{ model: getSharedSliceModel({ ids: ["address"] }) },
				{ model: getSharedSliceModel({ ids: ["address", "authorLastName"] }) },
			],
			previousPath: ["author", "authorLastName"],
			newPath: ["author", "authorLastName_CHANGED"],
			onUpdate,
		});

		// less calls than models because onUpdate is only called if the model has changed
		expect(onUpdate).toHaveBeenCalledTimes(2);

		expect(onUpdate).toHaveBeenCalledWith({
			previousModel: getSharedSliceModel({ ids: ["authorLastName"] }),
			model: getSharedSliceModel({ ids: ["authorLastName_CHANGED"] }),
		});
		expect(onUpdate).toHaveBeenCalledWith({
			previousModel: getSharedSliceModel({
				ids: ["address", "authorLastName"],
			}),
			model: getSharedSliceModel({
				ids: ["address", "authorLastName_CHANGED"],
			}),
		});
	});

	it("should update GROUP field ids", async () => {
		const onUpdate = vi.fn();
		updateSharedSliceContentRelationships({
			models: [
				{ model: getSharedSliceModel({ groupIds: ["shortCode"] }) },
				{ model: getSharedSliceModel({ groupIds: ["flag"] }) },
				{ model: getSharedSliceModel({ groupIds: ["shortCode", "flag"] }) },
			],
			previousPath: ["author", "languages", "shortCode"],
			newPath: ["author", "languages", "shortCode_CHANGED"],
			onUpdate,
		});

		// less calls than models because onUpdate is only called if the model has changed
		expect(onUpdate).toHaveBeenCalledTimes(2);

		expect(onUpdate).toHaveBeenCalledWith({
			previousModel: getSharedSliceModel({ groupIds: ["shortCode"] }),
			model: getSharedSliceModel({ groupIds: ["shortCode_CHANGED"] }),
		});
		expect(onUpdate).toHaveBeenCalledWith({
			previousModel: getSharedSliceModel({
				groupIds: ["shortCode", "flag"],
			}),
			model: getSharedSliceModel({
				groupIds: ["shortCode_CHANGED", "flag"],
			}),
		});

		updateSharedSliceContentRelationships({
			models: [{ model: getSharedSliceModel() }],
			previousPath: ["author", "languages"],
			newPath: ["author", "languages_CHANGED"],
			onUpdate,
		});

		expect(onUpdate).toHaveBeenCalledWith({
			previousModel: getSharedSliceModel({ groupId: "languages" }),
			model: getSharedSliceModel({ groupId: "languages_CHANGED" }),
		}); // changed
	});

	it("should update slice NESTED content relationship ids", async () => {
		const onUpdate = vi.fn();
		updateSharedSliceContentRelationships({
			models: [
				{ model: getSharedSliceModel({ nestedIds: ["city"] }) },
				{ model: getSharedSliceModel({ nestedIds: ["addressLine1"] }) },
				{ model: getSharedSliceModel({ nestedIds: ["addressLine1", "city"] }) },
			],
			previousPath: ["address", "city"],
			newPath: ["address", "city_CHANGED"],
			onUpdate,
		});

		// less calls than models because onUpdate is only called if the model has changed
		expect(onUpdate).toHaveBeenCalledTimes(2);

		expect(onUpdate).toHaveBeenCalledWith({
			previousModel: getSharedSliceModel({ nestedIds: ["city"] }),
			model: getSharedSliceModel({ nestedIds: ["city_CHANGED"] }),
		});
		expect(onUpdate).toHaveBeenCalledWith({
			previousModel: getSharedSliceModel({
				nestedIds: ["addressLine1", "city"],
			}),
			model: getSharedSliceModel({
				nestedIds: ["addressLine1", "city_CHANGED"],
			}),
		});

		updateSharedSliceContentRelationships({
			models: [{ model: getSharedSliceModel() }],
			previousPath: ["author", "address_cr"],
			newPath: ["author", "address_cr_CHANGED"],
			onUpdate,
		});

		expect(onUpdate).toHaveBeenCalledWith({
			previousModel: getSharedSliceModel({ nestedCrId: "address_cr" }),
			model: getSharedSliceModel({ nestedCrId: "address_cr_CHANGED" }),
		}); // changed
	});

	it("should update NESTED GROUP field ids", async () => {
		const onUpdate = vi.fn();
		updateSharedSliceContentRelationships({
			models: [
				{ model: getSharedSliceModel({ nestedGroupIds: ["phone"] }) },
				{ model: getSharedSliceModel({ nestedGroupIds: ["email"] }) },
				{ model: getSharedSliceModel({ nestedGroupIds: ["phone", "email"] }) },
			],
			previousPath: ["address", "contactDetails", "phone"],
			newPath: ["address", "contactDetails", "phone_CHANGED"],
			onUpdate,
		});

		// less calls than models because onUpdate is only called if the model has changed
		expect(onUpdate).toHaveBeenCalledTimes(2);

		expect(onUpdate).toHaveBeenCalledWith({
			previousModel: getSharedSliceModel({ nestedGroupIds: ["phone"] }),
			model: getSharedSliceModel({ nestedGroupIds: ["phone_CHANGED"] }),
		});
		expect(onUpdate).toHaveBeenCalledWith({
			previousModel: getSharedSliceModel({
				nestedGroupIds: ["phone", "email"],
			}),
			model: getSharedSliceModel({
				nestedGroupIds: ["phone_CHANGED", "email"],
			}),
		});

		updateSharedSliceContentRelationships({
			models: [{ model: getSharedSliceModel() }],
			previousPath: ["address", "contactDetails"],
			newPath: ["address", "contactDetails_CHANGED"],
			onUpdate,
		});

		expect(onUpdate).toHaveBeenCalledWith({
			previousModel: getSharedSliceModel({ nestedGroupId: "contactDetails" }),
			model: getSharedSliceModel({ nestedGroupId: "contactDetails_CHANGED" }),
		}); // changed
	});

	it("should not update content relationship ids if the custom type id is not the same", async () => {
		const onUpdate = vi.fn();

		updateSharedSliceContentRelationships({
			models: [
				{
					model: getSharedSliceModel({
						ids: ["sameFieldName"],
						nestedIds: ["sameFieldName"],
					}),
				},
			],
			previousPath: ["differentCustomTypeId", "sameFieldName"],
			newPath: ["differentCustomTypeId", "sameFieldName_CHANGED"],
			onUpdate,
		});

		expect(onUpdate).not.toHaveBeenCalled();
	});

	it("should throw if there is no custom type of field id in previousPath and/or newPath", async () => {
		expect(() => {
			return updateSharedSliceContentRelationships({
				models: [{ model: getSharedSliceModel() }],
				previousPath: [],
				newPath: [],
				onUpdate: vi.fn(),
			});
		}).toThrow();
	});
});
