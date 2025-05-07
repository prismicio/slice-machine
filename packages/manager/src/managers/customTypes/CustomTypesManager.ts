import * as t from "io-ts";
import * as prismicCustomTypesClient from "@prismicio/custom-types-client";
import {
	CustomType,
	Group,
	Link,
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
	SliceUpdateHookReturnType,
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

type CRCustomTypes = NonNullable<NonNullable<Link["config"]>["customtypes"]>;
type CRCustomType = NonNullable<CRCustomTypes>[number];
type CustomTypeFieldIdChangedMeta = NonNullable<
	NonNullable<CustomTypeUpdateHookData["updateMeta"]>["fieldIdChanged"]
>;
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

	private updateCRCustomType(
		args: { customType: CRCustomType } & CustomTypeFieldIdChangedMeta,
	): CRCustomType {
		const { customType: customTypeArg, previousPath, newPath } = args;

		let customType = customTypeArg;
		if (typeof customTypeArg === "object") {
			customType = { ...customTypeArg };
		}

		const [previousId] = previousPath;
		const [newId] = newPath;

		if (!previousId || !newId) {
			return customType;
		}

		if (typeof customType === "string") {
			if (customType === previousId && customType !== newId) {
				return newId; // update to new api id
			}

			return customType;
		}

		if (customType.id == previousId && customType.id !== newId) {
			customType.id = newId; // update to new api id
		}

		if (customType.fields) {
			return {
				...customType,
				fields: customType.fields.map((field) => {
					const previousId = previousPath[1];
					const newId = newPath[1];

					if (!previousId || !newId) {
						return field;
					}

					if (typeof field === "string") {
						if (field === previousId && field !== newId) {
							return newId; // update to new api id
						}

						return field;
					}

					if (field.id === previousId && field.id !== newId) {
						field.id = newId; // update to new api id
					}

					return {
						...field,
						customtypes: field.customtypes.map((customType) => {
							return this.updateCRCustomType({
								customType,
								previousPath,
								newPath,
								// TODO: Fix types. The second level customtypes are not typed
								// the same as the first level customtypes. Although it won't
								// matter at runtime.
								// eslint-disable-next-line @typescript-eslint/no-explicit-any -- -
							}) as any;
						}),
					};
				}),
			};
		}

		return { ...customType };
	}

	/**
	 * Map over the custom types of a Content Relationship Link and update the API
	 * IDs that were changed during the custom type update.
	 */
	private updateCRCustomTypes(
		args: { customTypes: CRCustomTypes } & CustomTypeFieldIdChangedMeta,
	): CRCustomTypes {
		const { customTypes, ...updateMeta } = args;

		return customTypes.map((customType) => {
			return this.updateCRCustomType({ customType, ...updateMeta });
		});
	}

	/**
	 * Update the Content Relationship API IDs that were changed during the custom
	 * type update. The change is determined by the `previousPath` and `newPath`
	 * properties.
	 */
	private updateFieldContentRelationships<
		T extends UID | NestableWidget | Group | NestedGroup,
	>(args: { field: T } & CustomTypeFieldIdChangedMeta): T {
		const { field, ...updateMeta } = args;
		if (
			field.type !== "Link" ||
			field.config?.select !== "document" ||
			!field.config?.customtypes
		) {
			return field; // not a content relationship field
		}

		return {
			...field,
			config: {
				...field.config,
				customtypes: this.updateCRCustomTypes({
					...updateMeta,
					customTypes: field.config.customtypes.slice(),
				}),
			},
		};
	}

	async updateCustomType(
		args: CustomTypeUpdateHookData,
	): Promise<OnlyHookErrors<CallHookReturnType<CustomTypeUpdateHook>>> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"custom-type:update",
			args,
		);

		const { model, updateMeta } = args;

		if (updateMeta?.fieldIdChanged) {
			const crUpdatesPromises: Promise<{ errors: HookError[] }>[] = [];

			let { previousPath, newPath } = updateMeta.fieldIdChanged;

			if (previousPath.join(".") !== newPath.join(".")) {
				previousPath = [model.id, ...previousPath];
				newPath = [model.id, ...newPath];

				// Find existing content relationships that link to the renamed field id in
				// any custom type and update them to use the new one.
				const customTypes = await this.readAllCustomTypes();

				for (const customType of customTypes.models) {
					const updatedCustomTypeModel = traverseCustomType({
						customType: customType.model,
						onField: ({ field }) => {
							return this.updateFieldContentRelationships({
								field,
								previousPath,
								newPath,
							});
						},
					});

					crUpdatesPromises.push(
						this.sliceMachinePluginRunner.callHook("custom-type:update", {
							model: updatedCustomTypeModel,
						}),
					);
				}

				// Find existing slice with content relationships that link to the renamed
				// field id in all libraries and update them to use the new one.
				const { libraries } = await this.slices.readAllSliceLibraries();

				for (const library of libraries) {
					const slices = await this.slices.readAllSlicesForLibrary({
						libraryID: library.libraryID,
					});

					for (const slice of slices.models) {
						const updatedSliceModel = traverseSharedSlice({
							path: ["."],
							slice: slice.model,
							onField: ({ field }) => {
								return this.updateFieldContentRelationships({
									field,
									previousPath,
									newPath,
								});
							},
						});

						crUpdatesPromises.push(
							this.sliceMachinePluginRunner.callHook("slice:update", {
								libraryID: library.libraryID,
								model: updatedSliceModel,
							}),
						);
					}
				}

				// Process all the Content Relationship updates at once.
				const crUpdatesResults = await Promise.all(crUpdatesPromises);

				if (crUpdatesResults.some((result) => result.errors.length > 0)) {
					return {
						errors: crUpdatesResults.flatMap((result) => result.errors),
					};
				}
			}
		}

		return { errors: hookResult.errors };
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
