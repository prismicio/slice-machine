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
	CustomTypeUpdateHookData,
	HookError,
} from "@prismicio/plugin-kit";

import { DecodeError } from "../../lib/DecodeError";
import { assertPluginsInitialized } from "../../lib/assertPluginsInitialized";
import { decodeHookResult } from "../../lib/decodeHookResult";
import fetch from "../../lib/fetch";

import { OnlyHookErrors } from "../../types";
import { API_ENDPOINTS } from "../../constants/API_ENDPOINTS";
import { PRISMIC_CLI_USER_AGENT } from "../../constants/PRISMIC_CLI_USER_AGENT";

import { BaseManager } from "../BaseManager";
import { CustomTypeFormat } from "./types";

type PrismicManagerReadCustomTypeLibraryReturnType = {
	ids: string[];
	errors: (DecodeError | HookError)[];
};

type CustomTypesManagerReadAllCustomTypesArgs = {
	format: CustomTypeFormat;
};

type PrismicManagerReadAllCustomTypeReturnType = {
	models: { model: CustomType }[];
	errors: (DecodeError | HookError)[];
};

type PrismicManagerReadCustomTypeReturnType = {
	model: CustomType | undefined;
	errors: (DecodeError | HookError)[];
};

type PrismicManagerUpdateCustomTypeArgs = CustomTypeUpdateHookData;

type CustomTypesManagerDeleteCustomTypeArgs = {
	id: string;
};

type CustomTypesManagerDeleteCustomTypeReturnType = {
	errors: (DecodeError | HookError)[];
};

type CustomTypesManagerUpdateCustomTypeReturnType = {
	errors: (DecodeError | HookError)[];
};

export class CustomTypesManager extends BaseManager {
	async readCustomTypeLibrary(): Promise<PrismicManagerReadCustomTypeLibraryReturnType> {
		assertPluginsInitialized(this.pluginSystemRunner);

		const hookResult = await this.pluginSystemRunner.callHook(
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
	): Promise<PrismicManagerReadAllCustomTypeReturnType> {
		assertPluginsInitialized(this.pluginSystemRunner);

		const res: PrismicManagerReadAllCustomTypeReturnType = {
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
		assertPluginsInitialized(this.pluginSystemRunner);

		const hookResult = await this.pluginSystemRunner.callHook(
			"custom-type:create",
			args,
		);

		return {
			errors: hookResult.errors,
		};
	}

	async readCustomType(
		args: CustomTypeReadHookData,
	): Promise<PrismicManagerReadCustomTypeReturnType> {
		assertPluginsInitialized(this.pluginSystemRunner);

		const hookResult = await this.pluginSystemRunner.callHook(
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
		args: PrismicManagerUpdateCustomTypeArgs,
	): Promise<CustomTypesManagerUpdateCustomTypeReturnType> {
		assertPluginsInitialized(this.pluginSystemRunner);
		const { model } = args;

		const customTypeUpdateResult = await this.pluginSystemRunner.callHook(
			"custom-type:update",
			{ model },
		);

		if (customTypeUpdateResult.errors.length > 0) {
			return { errors: customTypeUpdateResult.errors };
		}

		return { errors: [] };
	}

	async renameCustomType(
		args: CustomTypeRenameHookData,
	): Promise<OnlyHookErrors<CallHookReturnType<CustomTypeRenameHook>>> {
		assertPluginsInitialized(this.pluginSystemRunner);

		const hookResult = await this.pluginSystemRunner.callHook(
			"custom-type:rename",
			args,
		);

		return {
			errors: hookResult.errors,
		};
	}

	async deleteCustomType(
		args: CustomTypesManagerDeleteCustomTypeArgs,
	): Promise<CustomTypesManagerDeleteCustomTypeReturnType> {
		assertPluginsInitialized(this.pluginSystemRunner);

		const { model, errors: readCustomTypeErrors } = await this.readCustomType({
			id: args.id,
		});

		if (model) {
			const hookResult = await this.pluginSystemRunner.callHook(
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

	async fetchRemoteCustomTypes(): Promise<CustomType[]> {
		const authenticationToken = await this.user.getAuthenticationToken();
		const repositoryName = await this.project.getRepositoryName();

		const client = prismicCustomTypesClient.createClient({
			endpoint: API_ENDPOINTS.PrismicLegacyCustomTypesApi,
			repositoryName,
			token: authenticationToken,
			fetch,
			fetchOptions: {
				headers: {
					"User-Agent": PRISMIC_CLI_USER_AGENT,
				},
			},
		});

		return await client.getAllCustomTypes();
	}
}
