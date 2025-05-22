import * as t from "io-ts";
import * as prismicCustomTypesClient from "@prismicio/custom-types-client";
import {
	CustomType,
	Group,
	NestableWidget,
	NestedGroup,
	SharedSlice,
	UID,
	traverseCustomType,
	traverseSharedSlice,
} from "@prismicio/types-internal/lib/customtypes";
import {
	CallHookReturnType,
	CustomTypeCreateHook,
	CustomTypeCreateHookData,
	CustomTypeReadHookData,
	CustomTypeRenameHook,
	CustomTypeRenameHookData,
	CustomTypeUpdateHook,
	CustomTypeUpdateHookData,
	HookError,
} from "@slicemachine/plugin-kit";
import { z } from "zod";

import { DecodeError } from "../../lib/DecodeError";
import { assertPluginsInitialized } from "../../lib/assertPluginsInitialized";
import { decodeHookResult } from "../../lib/decodeHookResult";
import fetch from "../../lib/fetch";

import { OnlyHookErrors } from "../../types";
import { API_ENDPOINTS } from "../../constants/API_ENDPOINTS";
import { SLICE_MACHINE_USER_AGENT } from "../../constants/SLICE_MACHINE_USER_AGENT";
import { UnauthorizedError } from "../../errors";

import { BaseManager } from "../BaseManager";
import { CustomTypeFormat } from "./types";

type SliceMachineManagerReadCustomTypeLibraryReturnType = {
	ids: string[];
	errors: (DecodeError | HookError)[];
};

type CustomTypesManagerReadAllCustomTypesArgs = {
	format: CustomTypeFormat;
};

type SliceMachineManagerReadAllCustomTypeReturnType = {
	models: { model: CustomType }[];
	errors: (DecodeError | HookError)[];
};

type SliceMachineManagerReadCustomTypeReturnType = {
	model: CustomType | undefined;
	errors: (DecodeError | HookError)[];
};

type SliceMachineManagerPushCustomTypeArgs = {
	id: string;
	userAgent?: string;
};

type SliceMachineManagerReadCustomTypeMocksConfigArgs = {
	customTypeID: string;
};

type SliceMachineManagerReadCustomTypeMocksConfigArgsReturnType = {
	// TODO
	mocksConfig?: Record<string, unknown>;
	errors: HookError[];
};

type SliceMachineManagerUpdateCustomTypeMocksConfigArgs = {
	customTypeID: string;
	// TODO
	mocksConfig: Record<string, unknown>;
};

type SliceMachineManagerUpdateCustomTypeMocksConfigArgsReturnType = {
	errors: HookError[];
};

type CustomTypesMachineManagerDeleteCustomTypeArgs = {
	id: string;
};

type CustomTypesMachineManagerDeleteCustomTypeReturnType = {
	errors: (DecodeError | HookError)[];
};

type CustomTypesMachineManagerUpdateCustomTypeReturnType = {
	errors: (DecodeError | HookError)[];
};

type CustomTypeFieldIdChangedMeta = {
	previousPath: string[];
	newPath: string[];
};

type CrCustomType =
	| string
	| { id: string; fields?: readonly CrCustomTypeNestedCr[] };
type CrCustomTypeNestedCr =
	| string
	| { id: string; customtypes: readonly CrCustomTypeFieldLeaf[] };
type CrCustomTypeFieldLeaf =
	| string
	| { id: string; fields?: readonly string[] };

export class CustomTypesManager extends BaseManager {
	async readCustomTypeLibrary(): Promise<SliceMachineManagerReadCustomTypeLibraryReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"custom-type-library:read",
			undefined,
		);
		const { data, errors } = decodeHookResult(
			t.type({
				ids: t.array(t.string),
			}),
			hookResult,
		);

		return {
			ids: data[0]?.ids || [],
			errors,
		};
	}

	async readAllCustomTypes(
		args?: CustomTypesManagerReadAllCustomTypesArgs,
	): Promise<SliceMachineManagerReadAllCustomTypeReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const res: SliceMachineManagerReadAllCustomTypeReturnType = {
			models: [],
			errors: [],
		};

		const { ids, errors } = await this.readCustomTypeLibrary();
		res.errors = [...res.errors, ...errors];

		if (ids) {
			for (const id of ids) {
				const { model, errors } = await this.readCustomType({ id });
				res.errors = [...res.errors, ...errors];

				if (model && (!args || args.format === model.format)) {
					res.models.push({ model });
				}
			}
		}

		return res;
	}

	async createCustomType(
		args: CustomTypeCreateHookData,
	): Promise<OnlyHookErrors<CallHookReturnType<CustomTypeCreateHook>>> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"custom-type:create",
			args,
		);

		return {
			errors: hookResult.errors,
		};
	}

	async readCustomType(
		args: CustomTypeReadHookData,
	): Promise<SliceMachineManagerReadCustomTypeReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"custom-type:read",
			args,
		);
		const { data, errors } = decodeHookResult(
			t.type({
				model: CustomType,
			}),
			hookResult,
		);

		return {
			model: data[0]?.model,
			errors,
		};
	}

	/**
	 * Update the Content Relationship API IDs for all existing custom types and
	 * slices. The change is determined by properties inside the `updateMeta`
	 * property.
	 */
	private async updateContentRelationships(
		args: { model: CustomType } & CustomTypeFieldIdChangedMeta,
	): Promise<
		OnlyHookErrors<CallHookReturnType<CustomTypeUpdateHook>> & {
			rollback?: () => Promise<void>;
		}
	> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		let { model, newPath, previousPath } = args;

		if (previousPath.join(".") !== newPath.join(".")) {
			previousPath = [model.id, ...previousPath];
			newPath = [model.id, ...newPath];

			const crUpdates: {
				updatePromise: Promise<{ errors: HookError[] }>;
				rollback: () => void;
			}[] = [];

			// Find existing content relationships that link to the renamed field id in
			// any custom type and update them to use the new one.
			const customTypes = await this.readAllCustomTypes();

			updateCustomTypeContentRelationships({
				models: customTypes.models,
				onUpdate: ({ previousModel, model }) => {
					assertPluginsInitialized(this.sliceMachinePluginRunner);

					crUpdates.push({
						updatePromise: this.sliceMachinePluginRunner?.callHook(
							"custom-type:update",
							{ model },
						),
						rollback: () => {
							this.sliceMachinePluginRunner?.callHook("custom-type:update", {
								model: previousModel,
							});
						},
					});
				},
				previousPath,
				newPath,
			});

			// Find existing slice with content relationships that link to the renamed
			// field id in all libraries and update them to use the new one.
			const { libraries } = await this.slices.readAllSliceLibraries();

			for (const library of libraries) {
				const slices = await this.slices.readAllSlicesForLibrary({
					libraryID: library.libraryID,
				});

				updateSharedSliceContentRelationships({
					models: slices.models,
					onUpdate: ({ previousModel, model }) => {
						assertPluginsInitialized(this.sliceMachinePluginRunner);

						crUpdates.push({
							updatePromise: this.sliceMachinePluginRunner?.callHook(
								"slice:update",
								{ libraryID: library.libraryID, model },
							),
							rollback: () => {
								this.sliceMachinePluginRunner?.callHook("slice:update", {
									libraryID: library.libraryID,
									model: previousModel,
								});
							},
						});
					},
					previousPath,
					newPath,
				});
			}

			// Process all the Content Relationship updates at once.
			const crUpdatesResult = await Promise.all(
				crUpdates.map((update) => update.updatePromise),
			);

			if (crUpdatesResult.some((result) => result.errors.length > 0)) {
				return {
					errors: crUpdatesResult.flatMap((result) => result.errors),
					rollback: async () => {
						await Promise.all(crUpdates.map((update) => update.rollback()));
					},
				};
			}
		}

		return { errors: [] };
	}

	async updateCustomType(
		args: CustomTypeUpdateHookData,
	): Promise<CustomTypesMachineManagerUpdateCustomTypeReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);
		const { model } = args;
		const { fieldIdChanged } = args.updateMeta ?? {};

		let previousCustomType: CustomType | undefined;

		if (fieldIdChanged) {
			const customTypeRead = await this.readCustomType({ id: model.id });

			if (customTypeRead.errors.length > 0) {
				return { errors: customTypeRead.errors };
			}
			if (!customTypeRead.model) {
				throw new Error(
					`readCustomType succeeded reading custom type ${model.id} but model is undefined.`,
				);
			}

			previousCustomType = customTypeRead.model;
		}

		const customTypeUpdateResult = await this.sliceMachinePluginRunner.callHook(
			"custom-type:update",
			{ model },
		);

		if (customTypeUpdateResult.errors.length > 0) {
			return { errors: customTypeUpdateResult.errors };
		}

		if (previousCustomType && fieldIdChanged) {
			const crUpdateResult = await this.updateContentRelationships({
				model: previousCustomType,
				previousPath: fieldIdChanged.previousPath,
				newPath: fieldIdChanged.newPath,
			});

			if (crUpdateResult.errors.length > 0) {
				// put the previous custom type back
				await this.sliceMachinePluginRunner?.callHook("custom-type:update", {
					model: previousCustomType,
				});
				// revert the content relationships updates
				await crUpdateResult.rollback?.();

				return { errors: crUpdateResult.errors };
			}
		}

		return { errors: [] };
	}

	async renameCustomType(
		args: CustomTypeRenameHookData,
	): Promise<OnlyHookErrors<CallHookReturnType<CustomTypeRenameHook>>> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"custom-type:rename",
			args,
		);

		return {
			errors: hookResult.errors,
		};
	}

	async deleteCustomType(
		args: CustomTypesMachineManagerDeleteCustomTypeArgs,
	): Promise<CustomTypesMachineManagerDeleteCustomTypeReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const { model, errors: readCustomTypeErrors } = await this.readCustomType({
			id: args.id,
		});

		if (model) {
			const hookResult = await this.sliceMachinePluginRunner.callHook(
				"custom-type:delete",
				{ model },
			);

			return {
				errors: hookResult.errors,
			};
		} else {
			return {
				errors: readCustomTypeErrors,
			};
		}
	}

	async pushCustomType(
		args: SliceMachineManagerPushCustomTypeArgs,
	): Promise<void> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const authenticationToken = await this.user.getAuthenticationToken();
		const repositoryName = await this.project.getResolvedRepositoryName();

		// TODO: Handle errors
		const { model } = await this.readCustomType({ id: args.id });

		if (model) {
			// TODO: Create a single shared client.
			const client = prismicCustomTypesClient.createClient({
				endpoint: API_ENDPOINTS.PrismicModels,
				repositoryName,
				token: authenticationToken,
				fetch,
				fetchOptions: {
					headers: {
						"User-Agent": args.userAgent || SLICE_MACHINE_USER_AGENT,
					},
				},
			});

			try {
				// Check if Custom Type already exists on the repository.
				await client.getCustomTypeByID(args.id);

				// If it exists on the repository, update it.
				await client.updateCustomType(model);
			} catch (error) {
				if (error instanceof prismicCustomTypesClient.NotFoundError) {
					// If it doesn't exist on the repository, insert it.
					await client.insertCustomType(model);
				} else if (error instanceof prismicCustomTypesClient.ForbiddenError) {
					throw new UnauthorizedError(
						"You do not have access to push types to this Prismic repository.",
						{
							cause: error,
						},
					);
				} else {
					throw error;
				}
			}
		}
	}

	// TODO: Remove
	async readCustomTypeMocksConfig(
		args: SliceMachineManagerReadCustomTypeMocksConfigArgs,
	): Promise<SliceMachineManagerReadCustomTypeMocksConfigArgsReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"custom-type:asset:read",
			{
				customTypeID: args.customTypeID,
				assetID: "mocks.config.json",
			},
		);
		const data = hookResult.data[0]?.data;

		// TODO: Validate the returned data.

		if (data) {
			return {
				mocksConfig: JSON.parse(data.toString()),
				errors: hookResult.errors,
			};
		} else {
			return {
				mocksConfig: undefined,
				errors: hookResult.errors,
			};
		}
	}

	// TODO: Remove
	async updateCustomTypeMocksConfig(
		args: SliceMachineManagerUpdateCustomTypeMocksConfigArgs,
	): Promise<SliceMachineManagerUpdateCustomTypeMocksConfigArgsReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"custom-type:asset:update",
			{
				customTypeID: args.customTypeID,
				asset: {
					id: "mocks.config.json",
					data: Buffer.from(JSON.stringify(args.mocksConfig, null, "\t")),
				},
			},
		);

		return {
			errors: hookResult.errors,
		};
	}

	async fetchRemoteCustomTypes(): Promise<CustomType[]> {
		const authenticationToken = await this.user.getAuthenticationToken();
		const repositoryName = await this.project.getResolvedRepositoryName();

		const client = prismicCustomTypesClient.createClient({
			endpoint: API_ENDPOINTS.PrismicModels,
			repositoryName,
			token: authenticationToken,
			fetch,
			fetchOptions: {
				headers: {
					"User-Agent": SLICE_MACHINE_USER_AGENT,
				},
			},
		});

		return await client.getAllCustomTypes();
	}

	async inferSlice({
		imageUrl,
	}: {
		imageUrl: string;
	}): Promise<InferSliceResponse> {
		const authToken = await this.user.getAuthenticationToken();
		const headers = {
			Authorization: `Bearer ${authToken}`,
		};

		const repository = await this.project.getResolvedRepositoryName();
		const searchParams = new URLSearchParams({
			repository,
		});

		const url = new URL("./slices/infer", API_ENDPOINTS.CustomTypeService);
		url.search = searchParams.toString();

		const response = await fetch(url.toString(), {
			method: "POST",
			headers: headers,
			body: JSON.stringify({ imageUrl }),
		});

		if (!response.ok) {
			throw new Error(`Failed to infer slice: ${response.statusText}`);
		}

		const json = await response.json();

		return InferSliceResponse.parse(json);
	}
}

type InferSliceResponse = z.infer<typeof InferSliceResponse>;

const InferSliceResponse = z.object({
	slice: z.custom().transform((value, ctx) => {
		const result = SharedSlice.decode(value);
		if (result._tag === "Right") {
			return result.right;
		}
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: `Invalid shared slice: ${JSON.stringify(value, null, 2)}`,
		});

		return z.NEVER;
	}),
	langSmithUrl: z.string().url().optional(),
});

function updateCRCustomType(
	args: { customType: CrCustomType } & CustomTypeFieldIdChangedMeta,
): CrCustomType {
	const [previousCustomTypeId, previousFieldId] = args.previousPath;
	const [newCustomTypeId, newFieldId] = args.newPath;

	if (!previousCustomTypeId || !newCustomTypeId) {
		throw new Error(
			"Could not find a customtype id in previousPath and/or newPath, which should not be possible.",
		);
	}

	if (!previousFieldId || !newFieldId) {
		throw new Error(
			"Could not find a field id in previousPath and/or newPath, which should not be possible.",
		);
	}

	const customType = shallowCloneIfObject(args.customType);

	if (typeof customType === "string" || !customType.fields) {
		return customType;
	}

	const matchedCustomTypeId = customType.id === previousCustomTypeId;

	const newFields = customType.fields.map((fieldArg) => {
		const customTypeField = shallowCloneIfObject(fieldArg);

		if (typeof customTypeField === "string") {
			if (
				matchedCustomTypeId &&
				customTypeField === previousFieldId &&
				customTypeField !== newFieldId
			) {
				// We have reached a field id that matches the id that was renamed,
				// so we update it new one. The field is a string, so return the new
				// id.
				return newFieldId;
			}

			return customTypeField;
		}

		if (
			matchedCustomTypeId &&
			customTypeField.id === previousFieldId &&
			customTypeField.id !== newFieldId
		) {
			// We have reached a field id that matches the id that was renamed,
			// so we update it new one.
			// Since field is not a string, we don't exit, as we might have
			// something to update further down in customtypes.
			customTypeField.id = newFieldId;
		}

		return {
			...customTypeField,
			customtypes: customTypeField.customtypes.map((customTypeArg) => {
				const nestedCustomType = shallowCloneIfObject(customTypeArg);

				if (
					typeof nestedCustomType === "string" ||
					!nestedCustomType.fields ||
					// Since we are on the last level, if we don't start matching right
					// at the custom type id, we can return exit early because it's not
					// a match.
					nestedCustomType.id !== previousCustomTypeId
				) {
					return nestedCustomType;
				}

				return {
					...nestedCustomType,
					fields: nestedCustomType.fields.map((fieldArg) => {
						const nestedCustomTypeField = shallowCloneIfObject(fieldArg);

						if (
							nestedCustomTypeField === previousFieldId &&
							nestedCustomTypeField !== newFieldId
						) {
							// Matches the previous id, so we update it and return because
							// it's the last level.
							return newFieldId;
						}

						return nestedCustomTypeField;
					}),
				};
			}),
		};
	});

	return { ...customType, fields: newFields };
}

/**
 * Update the Content Relationship API IDs of a single field. The change is
 * determined by the `previousPath` and `newPath` properties.
 */
function updateFieldContentRelationships<
	T extends UID | NestableWidget | Group | NestedGroup,
>(args: { field: T } & CustomTypeFieldIdChangedMeta): T {
	const { field, ...updateMeta } = args;
	if (
		field.type !== "Link" ||
		field.config?.select !== "document" ||
		!field.config?.customtypes
	) {
		// not a content relationship field
		return field;
	}

	const newCustomTypes = field.config.customtypes.map((customType) => {
		return updateCRCustomType({ customType, ...updateMeta });
	});

	return {
		...field,
		config: { ...field.config, customtypes: newCustomTypes },
	};
}

export function updateCustomTypeContentRelationships(
	args: {
		models: { model: CustomType }[];
		onUpdate: (model: { previousModel: CustomType; model: CustomType }) => void;
	} & CustomTypeFieldIdChangedMeta,
): void {
	const { models, previousPath, newPath, onUpdate } = args;

	for (const { model: customType } of models) {
		const updatedCustomType = traverseCustomType({
			customType,
			onField: ({ field }) => {
				return updateFieldContentRelationships({
					field,
					previousPath,
					newPath,
				});
			},
		});

		if (!isEqualModel(customType, updatedCustomType)) {
			onUpdate({ model: updatedCustomType, previousModel: customType });
		}
	}
}

export function updateSharedSliceContentRelationships(
	args: {
		models: { model: SharedSlice }[];
		onUpdate: (model: {
			previousModel: SharedSlice;
			model: SharedSlice;
		}) => void;
	} & CustomTypeFieldIdChangedMeta,
): void {
	const { models, previousPath, newPath, onUpdate } = args;

	for (const { model: slice } of models) {
		const updateSlice = traverseSharedSlice({
			path: ["."],
			slice,
			onField: ({ field }) => {
				return updateFieldContentRelationships({
					field,
					previousPath,
					newPath,
				});
			},
		});

		if (!isEqualModel(slice, updateSlice)) {
			onUpdate({ model: updateSlice, previousModel: slice });
		}
	}
}

function isEqualModel<T extends CustomType | SharedSlice>(
	modelA: T,
	modelB: T,
): boolean {
	return JSON.stringify(modelA) === JSON.stringify(modelB);
}

function shallowCloneIfObject<T>(value: T): T {
	if (typeof value === "object") {
		return { ...value };
	}

	return value;
}
