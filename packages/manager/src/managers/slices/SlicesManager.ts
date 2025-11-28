import * as t from "io-ts";
import * as prismicCustomTypesClient from "@prismicio/custom-types-client";
import {
	SharedSlice,
	Variation,
} from "@prismicio/types-internal/lib/customtypes";
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

import { DecodeError } from "../../lib/DecodeError";
import { assertPluginsInitialized } from "../../lib/assertPluginsInitialized";
import { decodeHookResult } from "../../lib/decodeHookResult";
import fetch from "../../lib/fetch";

import { OnlyHookErrors } from "../../types";
import { PRISMIC_CLI_USER_AGENT } from "../../constants/PRISMIC_CLI_USER_AGENT";
import { API_ENDPOINTS } from "../../constants/API_ENDPOINTS";

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
	model: SharedSlice;
};

type PrismicManagerReadAllSlicesForLibraryReturnType = {
	models: { model: SharedSlice }[];
	errors: (DecodeError | HookError)[];
};

type PrismicManagerReadAllSlicesReturnType = {
	models: {
		libraryID: string;
		model: SharedSlice;
	}[];
	errors: (DecodeError | HookError)[];
};

type PrismicManagerReadSliceReturnType = {
	model: SharedSlice | undefined;
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

type PrismicManagerRenameSliceVariationArgs = {
	libraryID: string;
	sliceID: string;
	/**
	 * Current ID of the variation to rename.
	 */
	variationID: string;
	model: Variation;
};

type PrismicManagerRenameSliceVariationReturnType = {
	errors: (DecodeError | HookError)[];
};

type PrismicManagerDeleteSliceVariationArgs = {
	libraryID: string;
	sliceID: string;
	variationID: string;
};

type PrismicManagerDeleteSliceVariationReturnType = {
	errors: (DecodeError | HookError)[];
};

export class SlicesManager extends BaseManager {
	async readSliceLibrary(
		args: SliceLibraryReadHookData,
	): Promise<SlicesManagerReadSliceLibraryReturnType> {
		assertPluginsInitialized(this.pluginSystemRunner);

		// TODO: Should validation happen at the `callHook` level?
		// Including validation at the hook level would ensure
		// hook-based actions are validated.
		const hookResult = await this.pluginSystemRunner.callHook(
			"slice-library:read",
			args,
		);
		const { data, errors } = decodeHookResult(
			t.type({
				id: t.string,
				sliceIDs: t.array(t.string),
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
			t.type({
				model: SharedSlice,
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

	async renameSliceVariation(
		args: PrismicManagerRenameSliceVariationArgs,
	): Promise<PrismicManagerRenameSliceVariationReturnType> {
		assertPluginsInitialized(this.pluginSystemRunner);

		// TODO: Remove when we support renaming variation ID, see: DT-1708
		if (args.variationID !== args.model.id) {
			throw new Error(
				"Renaming variation ID is not supported yet by the backend, only rename its name! For more information, see: https://linear.app/prismic/issue/DT-1708",
			);
		}

		const { model, errors: readSliceErrors } = await this.readSlice({
			libraryID: args.libraryID,
			sliceID: args.sliceID,
		});

		if (model) {
			// Find and rename the variation
			const updatedModel = {
				...model,
				variations: model.variations.map((variation) => {
					if (variation.id === args.variationID) {
						// Matches the slice we want to rename
						return args.model;
					} else if (variation.id === args.model.id) {
						// Matches any other slice that has the ID of the renamed variation and throw.
						// This should be validated on the frontend first for better UX, this is only backend validation.
						throw new Error(
							`Cannot rename variation \`${args.variationID}\` to \`${args.model.id}\`. A variation already exists with that ID in slice \`${args.sliceID}\` from library \`${args.libraryID}\`, try deleting it first or choose another variation ID to rename that slice.`,
						);
					}

					return variation;
				}),
			};
			const updateSliceHookResult = await this.pluginSystemRunner.callHook(
				"slice:update",
				{
					libraryID: args.libraryID,
					model: updatedModel,
				},
			);

			return {
				errors: updateSliceHookResult.errors,
			};
		} else {
			return {
				errors: readSliceErrors,
			};
		}
	}

	async deleteSliceVariation(
		args: PrismicManagerDeleteSliceVariationArgs,
	): Promise<PrismicManagerDeleteSliceVariationReturnType> {
		assertPluginsInitialized(this.pluginSystemRunner);

		const { model, errors: readSliceErrors } = await this.readSlice({
			libraryID: args.libraryID,
			sliceID: args.sliceID,
		});

		if (model) {
			// Remove variation from model and update it
			const updatedModel = {
				...model,
				variations: model.variations.filter(
					(variation) => variation.id !== args.variationID,
				),
			};
			const updateSliceHookResult = await this.pluginSystemRunner.callHook(
				"slice:update",
				{
					libraryID: args.libraryID,
					model: updatedModel,
				},
			);

			return {
				errors: updateSliceHookResult.errors,
			};
		} else {
			return {
				errors: readSliceErrors,
			};
		}
	}

	async fetchRemoteSlices(): Promise<SharedSlice[]> {
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
