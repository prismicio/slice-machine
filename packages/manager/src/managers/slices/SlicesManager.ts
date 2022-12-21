import * as t from "io-ts";
import fetch from "node-fetch";
import * as prismicCustomTypesClient from "@prismicio/custom-types-client";
import { CustomTypes } from "@prismicio/types-internal";
import {
	CallHookReturnType,
	HookError,
	SliceAssetUpdateHook,
	SliceCreateHook,
	SliceCreateHookData,
	SliceDeleteHook,
	SliceDeleteHookData,
	SliceLibraryReadHookData,
	SliceReadHookData,
	SliceRenameHook,
	SliceRenameHookData,
	SliceUpdateHook,
	SliceUpdateHookData,
} from "@slicemachine/plugin-kit";

import { DecodeError } from "../../lib/DecodeError";
import { assertPluginsInitialized } from "../../lib/assertPluginsInitialized";
import { bufferCodec } from "../../lib/bufferCodec";
import { decodeHookResult } from "../../lib/decodeHookResult";

import { OnlyHookErrors } from "../../types";
import { DEFAULT_SLICE_SCREENSHOT_URL } from "../../constants/DEFAULT_SLICE_SCREENSHOT_URL";
import { API_ENDPOINTS } from "../../constants/API_ENDPOINTS";
import { UnauthorizedError } from "../../errors";

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

type SliceMachineManagerReadAllSlicesForLibraryArgs = {
	libraryID: string;
};

type SliceMachineManagerReadAllSlicesForLibraryReturnType = {
	models: { model: CustomTypes.Widgets.Slices.SharedSlice }[];
	errors: (DecodeError | HookError)[];
};

type SliceMachineManagerReadAllSlicesReturnType = {
	models: {
		libraryID: string;
		model: CustomTypes.Widgets.Slices.SharedSlice;
	}[];
	errors: (DecodeError | HookError)[];
};

type SliceMachineManagerReadSliceReturnType = {
	model: CustomTypes.Widgets.Slices.SharedSlice;
	errors: (DecodeError | HookError)[];
};

type SliceMachineManagerPushSliceArgs = {
	libraryID: string;
	sliceID: string;
};

export type SliceMachineManagerPushSliceReturnType = {
	/**
	 * A record of Slice variation IDs mapped to uploaded screenshot URLs.
	 */
	screenshotURLs: Record<string, string> | undefined;
	errors: (DecodeError | HookError)[];
};

type SliceMachineManagerReadSliceScreenshotArgs = {
	libraryID: string;
	sliceID: string;
	variationID: string;
};

type SliceMachineManagerReadSliceScreenshotReturnType = {
	data: Buffer | undefined;
	errors: (DecodeError | HookError)[];
};

type SliceMachineManagerUpdateSliceScreenshotArgs = {
	libraryID: string;
	sliceID: string;
	variationID: string;
	data: Buffer;
};

type SliceMachineManagerReadSliceMocksArgs = {
	libraryID: string;
	sliceID: string;
};

type SliceMachineManagerReadSliceMocksReturnType = {
	mocks?: CustomTypes.Widgets.Slices.SharedSlice[];
	errors: HookError[];
};

type SliceMachineManagerReadSliceMocksConfigArgs = {
	libraryID: string;
	sliceID: string;
};

type SliceMachineManagerReadSliceMocksConfigArgsReturnType = {
	// TODO
	mocksConfig?: Record<string, unknown>;
	errors: HookError[];
};

type SliceMachineManagerUpdateSliceMocksConfigArgs = {
	libraryID: string;
	sliceID: string;
	// TODO
	mocksConfig?: Record<string, unknown>;
};

type SliceMachineManagerUpdateSliceMocksConfigArgsReturnType = {
	errors: HookError[];
};

type SlicesManagerUpsertHostedSliceScrenshotsArgs = {
	libraryID: string;
	model: CustomTypes.Widgets.Slices.SharedSlice;
};

export class SlicesManager extends BaseManager {
	async readSliceLibrary(
		args: SliceLibraryReadHookData,
	): Promise<SlicesManagerReadSliceLibraryReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		// TODO: Should validation happen at the `callHook` level?
		// Including validation at the hook level would ensure
		// hook-based actions are validated.
		const hookResult = await this.sliceMachinePluginRunner.callHook(
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

	async readAllSliceLibraries(): Promise<SlicesManagerReadAllSliceLibrariesReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const sliceMachineConfig = await this.project.getSliceMachineConfig();
		const libraryIDs = sliceMachineConfig.libraries || [];

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
		args: SliceMachineManagerReadAllSlicesForLibraryArgs,
	): Promise<SliceMachineManagerReadAllSlicesForLibraryReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const res: SliceMachineManagerReadAllSlicesForLibraryReturnType = {
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

	async readAllSlices(): Promise<SliceMachineManagerReadAllSlicesReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const sliceMachineConfig = await this.project.getSliceMachineConfig();
		const libraryIDs = sliceMachineConfig.libraries || [];

		const res: SliceMachineManagerReadAllSlicesReturnType = {
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
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"slice:create",
			args,
		);

		return {
			errors: hookResult.errors,
		};
	}

	async readSlice(
		args: SliceReadHookData,
	): Promise<SliceMachineManagerReadSliceReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"slice:read",
			args,
		);
		const { data, errors } = decodeHookResult(
			t.type({
				model: CustomTypes.Widgets.Slices.SharedSlice,
			}),
			hookResult,
		);

		return {
			model: data[0]?.model,
			errors,
		};
	}

	async updateSlice(
		args: SliceUpdateHookData,
	): Promise<OnlyHookErrors<CallHookReturnType<SliceUpdateHook>>> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"slice:update",
			args,
		);

		return {
			errors: hookResult.errors,
		};
	}

	async renameSlice(
		args: SliceRenameHookData,
	): Promise<OnlyHookErrors<CallHookReturnType<SliceRenameHook>>> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"slice:rename",
			args,
		);

		return {
			errors: hookResult.errors,
		};
	}

	// TODO: Disallow until Slices can be deleted.
	async deleteSlice(
		args: SliceDeleteHookData,
	): Promise<OnlyHookErrors<CallHookReturnType<SliceDeleteHook>>> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"slice:delete",
			args,
		);

		return {
			errors: hookResult.errors,
		};
	}

	/**
	 * @returns Record of variation IDs mapped to uploaded screenshot URLs.
	 */
	async pushSlice(
		args: SliceMachineManagerPushSliceArgs,
	): Promise<SliceMachineManagerPushSliceReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const { model, errors: readSliceErrors } = await this.readSlice({
			libraryID: args.libraryID,
			sliceID: args.sliceID,
		});

		if (model) {
			const modelWithScreenshots =
				await this._updateSliceModelScreenshotsInPlace({
					libraryID: args.libraryID,
					model,
				});

			const { errors: updateSliceErrors } = await this.updateSlice({
				libraryID: args.libraryID,
				model: modelWithScreenshots,
			});

			const authenticationToken = await this.user.getAuthenticationToken();
			const sliceMachineConfig = await this.project.getSliceMachineConfig();

			// TODO: Create a single shared client.
			const client = prismicCustomTypesClient.createClient({
				endpoint: API_ENDPOINTS.PrismicModels,
				repositoryName: sliceMachineConfig.repositoryName,
				token: authenticationToken,
				fetch,
			});

			try {
				// Check if Slice already exists on the repository.
				await client.getSharedSliceByID(args.sliceID);

				// If it exists on the repository, update it.
				await client.updateSharedSlice(modelWithScreenshots);
			} catch (error) {
				if (error instanceof prismicCustomTypesClient.NotFoundError) {
					// If the Slice doesn't exist on the repository, insert it.
					await client.insertSharedSlice(modelWithScreenshots);
				} else if (error instanceof prismicCustomTypesClient.ForbiddenError) {
					throw new UnauthorizedError(
						"You do not have access to push Slices to this Prismic repository.",
					);
				} else {
					// Pass the error through if it isn't the one we were expecting.
					throw error;
				}
			}

			const screenshotURLs: Record<string, string> = {};
			for (const variation of modelWithScreenshots.variations) {
				screenshotURLs[variation.id] = variation.imageUrl;
			}

			return {
				screenshotURLs,
				errors: [...readSliceErrors, ...updateSliceErrors],
			};
		} else {
			return {
				screenshotURLs: undefined,
				errors: readSliceErrors,
			};
		}
	}

	async readSliceScreenshot(
		args: SliceMachineManagerReadSliceScreenshotArgs,
	): Promise<SliceMachineManagerReadSliceScreenshotReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"slice:asset:read",
			{
				libraryID: args.libraryID,
				sliceID: args.sliceID,
				assetID: `screenshot-${args.variationID}.png`,
			},
		);
		const { data, errors } = decodeHookResult(
			t.type({
				data: bufferCodec,
			}),
			hookResult,
		);

		return {
			data: data[0]?.data,
			errors: errors,
		};
	}

	async updateSliceScreenshot(
		args: SliceMachineManagerUpdateSliceScreenshotArgs,
	): Promise<OnlyHookErrors<CallHookReturnType<SliceAssetUpdateHook>>> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"slice:asset:update",
			{
				libraryID: args.libraryID,
				sliceID: args.sliceID,
				asset: {
					id: `screenshot-${args.variationID}.png`,
					data: args.data,
				},
			},
		);

		return {
			errors: hookResult.errors,
		};
	}

	async readSliceMocks(
		args: SliceMachineManagerReadSliceMocksArgs,
	): Promise<SliceMachineManagerReadSliceMocksReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"slice:asset:read",
			{
				libraryID: args.libraryID,
				sliceID: args.sliceID,
				assetID: `mocks.json`,
			},
		);
		const data = hookResult.data[0]?.data;

		// TODO: Validate the returned mocks.

		if (data) {
			return {
				mocks: JSON.parse(data.toString()),
				errors: hookResult.errors,
			};
		} else {
			return {
				mocks: [],
				errors: hookResult.errors,
			};
		}
	}

	async readSliceMocksConfig(
		args: SliceMachineManagerReadSliceMocksConfigArgs,
	): Promise<SliceMachineManagerReadSliceMocksConfigArgsReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"slice:asset:read",
			{
				libraryID: args.libraryID,
				sliceID: args.sliceID,
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

	async updateSliceMocksConfig(
		args: SliceMachineManagerUpdateSliceMocksConfigArgs,
	): Promise<SliceMachineManagerUpdateSliceMocksConfigArgsReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"slice:asset:update",
			{
				libraryID: args.libraryID,
				sliceID: args.sliceID,
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

	async fetchRemoteSlices(): Promise<CustomTypes.Widgets.Slices.SharedSlice[]> {
		const authenticationToken = await this.user.getAuthenticationToken();
		const sliceMachineConfig = await this.project.getSliceMachineConfig();

		const client = prismicCustomTypesClient.createClient({
			endpoint: API_ENDPOINTS.PrismicModels,
			repositoryName: sliceMachineConfig.repositoryName,
			token: authenticationToken,
			fetch,
		});

		return await client.getAllSharedSlices();
	}

	private async _updateSliceModelScreenshotsInPlace(
		args: SlicesManagerUpsertHostedSliceScrenshotsArgs,
	): Promise<CustomTypes.Widgets.Slices.SharedSlice> {
		const sliceMachineConfig = await this.project.getSliceMachineConfig();

		const variations = await Promise.all(
			args.model.variations.map(async (variation) => {
				const updatedVariation: CustomTypes.Widgets.Slices.Variation = {
					...variation,
					imageUrl: DEFAULT_SLICE_SCREENSHOT_URL,
				};

				const screenshot = await this.readSliceScreenshot({
					libraryID: args.libraryID,
					sliceID: args.model.id,
					variationID: variation.id,
				});

				if (screenshot.data) {
					const keyPrefix = [
						sliceMachineConfig.repositoryName,
						"shared-slices",
						args.model.id,
						variation.id,
					].join("/");

					// TODO: If the existing imageUrl
					// property (not the prefilled efault
					// URL) is identical to the new image
					// (we'll need to get the image's full
					// URL before we upload it), then don't
					// upload anything.

					const uploadedScreenshot = await this.screenshots.uploadScreenshot({
						data: screenshot.data,
						keyPrefix,
					});

					updatedVariation.imageUrl = uploadedScreenshot.url;
				}

				return updatedVariation;
			}),
		);

		return {
			...args.model,
			variations,
		};
	}
}
