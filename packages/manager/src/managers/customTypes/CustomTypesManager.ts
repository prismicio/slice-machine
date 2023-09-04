import * as t from "io-ts";
import * as prismicCustomTypesClient from "@prismicio/custom-types-client";
import { CustomType } from "@prismicio/types-internal/lib/customtypes";
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

	async updateCustomType(
		args: CustomTypeUpdateHookData,
	): Promise<OnlyHookErrors<CallHookReturnType<CustomTypeUpdateHook>>> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"custom-type:update",
			args,
		);

		return {
			errors: hookResult.errors,
		};
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
		const sliceMachineConfig = await this.project.getSliceMachineConfig();

		// TODO: Handle errors
		const { model } = await this.readCustomType({ id: args.id });

		if (model) {
			// TODO: Create a single shared client.
			const client = prismicCustomTypesClient.createClient({
				endpoint: API_ENDPOINTS.PrismicModels,
				repositoryName: sliceMachineConfig.repositoryName,
				token: authenticationToken,
				userAgent: args.userAgent || SLICE_MACHINE_USER_AGENT,
				fetch,
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
		const sliceMachineConfig = await this.project.getSliceMachineConfig();

		const client = prismicCustomTypesClient.createClient({
			endpoint: API_ENDPOINTS.PrismicModels,
			repositoryName: sliceMachineConfig.repositoryName,
			token: authenticationToken,
			userAgent: SLICE_MACHINE_USER_AGENT,
			fetch,
		});

		return await client.getAllCustomTypes();
	}
}
