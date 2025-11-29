import * as prismicCustomTypesClient from "@prismicio/custom-types-client";
import {
	CallHookReturnType,
	HookError,
	SliceCreateHook,
	SliceCreateHookData,
	SliceLibraryReadHookData,
	SliceReadHookData,
	SliceRenameHook,
	SliceRenameHookData,
	SliceUpdateHook,
} from "@prismicio/plugin-kit";
import TypesInternal from "@prismicio/types-internal/lib/customtypes/index.js";
import fetch from "node-fetch";
import * as z from "zod";

import { API_ENDPOINTS } from "../../constants/API_ENDPOINTS";
import { PRISMIC_CLI_USER_AGENT } from "../../constants/PRISMIC_CLI_USER_AGENT";
import { DecodeError } from "../../lib/DecodeError";
import { assertPluginsInitialized } from "../../lib/assertPluginsInitialized";
import { decodeHookResult } from "../../lib/decodeHookResult";
import { SharedSliceSchema } from "../../lib/typesInternalSchemas";
import { OnlyHookErrors } from "../../types";
import { BaseManager } from "../BaseManager";

type SlicesManagerReadSliceLibraryReturnType = {
	sliceIDs: string[];
	errors: (DecodeError | HookError)[];
};

type SlicesManagerReadAllSliceLibrariesReturnType = {
	libraries: {
		libraryID: string;
		sliceIDs: string[] | undefined;
	}[];
	errors: (DecodeError | HookError)[];
};

type PrismicManagerReadAllSlicesForLibraryArgs = {
	libraryID: string;
};

type PrismicManagerUpdateSliceArgs = {
	libraryID: string;
	model: TypesInternal.SharedSlice;
};

type PrismicManagerReadAllSlicesForLibraryReturnType = {
	models: { model: TypesInternal.SharedSlice }[];
	errors: (DecodeError | HookError)[];
};

type PrismicManagerReadAllSlicesReturnType = {
	models: {
		libraryID: string;
		model: TypesInternal.SharedSlice;
	}[];
	errors: (DecodeError | HookError)[];
};

type PrismicManagerReadSliceReturnType = {
	model: TypesInternal.SharedSlice | undefined;
	errors: (DecodeError | HookError)[];
};

export type PrismicManagerPushSliceReturnType = {
	errors: (DecodeError | HookError)[];
};

type PrismicManagerDeleteSliceArgs = {
	libraryID: string;
	sliceID: string;
};

type PrismicManagerDeleteSliceReturnType = {
	errors: (DecodeError | HookError)[];
};

export class SlicesManager extends BaseManager {
	async readSliceLibrary(
		args: SliceLibraryReadHookData,
	): Promise<SlicesManagerReadSliceLibraryReturnType> {
		assertPluginsInitialized(this.pluginSystemRunner);

		const hookResult = await this.pluginSystemRunner.callHook(
			"slice-library:read",
			args,
		);
		const { data, errors } = decodeHookResult(
			z.object({
				id: z.string(),
				sliceIDs: z.array(z.string()),
			}),
			hookResult,
		);

		return {
			sliceIDs: data[0]?.sliceIDs ?? [],
			errors: errors,
		};
	}

	async getDefaultLibraryID(): Promise<string> {
		const prismicConfig = await this.project.getPrismicConfig();
		const libraryIDs = prismicConfig.libraries || [];

		return libraryIDs[0];
	}

	async readAllSliceLibraries(): Promise<SlicesManagerReadAllSliceLibrariesReturnType> {
		assertPluginsInitialized(this.pluginSystemRunner);

		const prismicConfig = await this.project.getPrismicConfig();
		const libraryIDs = prismicConfig.libraries || [];

		const res: SlicesManagerReadAllSliceLibrariesReturnType = {
			libraries: [],
			errors: [],
		};

		for (const libraryID of libraryIDs) {
			const { sliceIDs, errors } = await this.readSliceLibrary({
				libraryID,
			});
			res.errors = [...res.errors, ...errors];

			res.libraries.push({
				libraryID,
				sliceIDs,
			});
		}

		return res;
	}

	async readAllSlicesForLibrary(
		args: PrismicManagerReadAllSlicesForLibraryArgs,
	): Promise<PrismicManagerReadAllSlicesForLibraryReturnType> {
		assertPluginsInitialized(this.pluginSystemRunner);

		const res: PrismicManagerReadAllSlicesForLibraryReturnType = {
			models: [],
			errors: [],
		};

		const { sliceIDs, errors } = await this.readSliceLibrary({
			libraryID: args.libraryID,
		});
		res.errors.push(...errors);

		if (sliceIDs) {
			for (const sliceID of sliceIDs) {
				const { model, errors } = await this.readSlice({
					libraryID: args.libraryID,
					sliceID,
				});
				res.errors.push(...errors);

				if (model) {
					res.models.push({ model });
				}
			}
		}

		return res;
	}

	async readAllSlices(): Promise<PrismicManagerReadAllSlicesReturnType> {
		assertPluginsInitialized(this.pluginSystemRunner);

		const prismicConfig = await this.project.getPrismicConfig();
		const libraryIDs = prismicConfig.libraries || [];

		const res: PrismicManagerReadAllSlicesReturnType = {
			models: [],
			errors: [],
		};

		for (const libraryID of libraryIDs) {
			const { models, errors } = await this.readAllSlicesForLibrary({
				libraryID,
			});
			res.errors.push(...errors);

			for (const model of models) {
				res.models.push({
					libraryID,
					model: model.model,
				});
			}
		}

		return res;
	}

	async createSlice(
		args: SliceCreateHookData,
	): Promise<OnlyHookErrors<CallHookReturnType<SliceCreateHook>>> {
		assertPluginsInitialized(this.pluginSystemRunner);

		const hookResult = await this.pluginSystemRunner.callHook(
			"slice:create",
			args,
		);

		return {
			errors: hookResult.errors,
		};
	}

	async readSlice(
		args: SliceReadHookData,
	): Promise<PrismicManagerReadSliceReturnType> {
		assertPluginsInitialized(this.pluginSystemRunner);

		const hookResult = await this.pluginSystemRunner.callHook(
			"slice:read",
			args,
		);
		const { data, errors } = decodeHookResult(
			z.object({
				model: SharedSliceSchema,
			}),
			hookResult,
		);

		return {
			model: data[0]?.model,
			errors: errors.map((error) => {
				error.message = `Failed to decode slice model with id '${args.sliceID}': ${error.message}`;

				return error;
			}),
		};
	}

	async updateSlice(
		args: PrismicManagerUpdateSliceArgs,
	): Promise<OnlyHookErrors<CallHookReturnType<SliceUpdateHook>>> {
		assertPluginsInitialized(this.pluginSystemRunner);

		const hookResult = await this.pluginSystemRunner.callHook(
			"slice:update",
			args,
		);

		return {
			errors: [...hookResult.errors],
		};
	}

	async renameSlice(
		args: SliceRenameHookData,
	): Promise<OnlyHookErrors<CallHookReturnType<SliceRenameHook>>> {
		assertPluginsInitialized(this.pluginSystemRunner);

		const hookResult = await this.pluginSystemRunner.callHook(
			"slice:rename",
			args,
		);

		return {
			errors: hookResult.errors,
		};
	}

	async deleteSlice(
		args: PrismicManagerDeleteSliceArgs,
	): Promise<PrismicManagerDeleteSliceReturnType> {
		assertPluginsInitialized(this.pluginSystemRunner);

		const { model, errors: readSliceErrors } = await this.readSlice({
			libraryID: args.libraryID,
			sliceID: args.sliceID,
		});

		if (model) {
			const { errors: deleteSliceErrors } =
				await this.pluginSystemRunner.callHook("slice:delete", {
					model,
					libraryID: args.libraryID,
				});

			return {
				errors: deleteSliceErrors,
			};
		} else {
			return {
				errors: readSliceErrors,
			};
		}
	}

	async fetchRemoteSlices(): Promise<TypesInternal.SharedSlice[]> {
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

		return await client.getAllSharedSlices();
	}
}
