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
import { Viewport } from "puppeteer";

import { DecodeError } from "../lib/DecodeError";
import { assertPluginsInitialized } from "../lib/assertPluginsInitialized";
import { bufferCodec } from "../lib/bufferCodec";
import { captureSliceSimulatorScreenshot } from "../lib/captureSliceSimulatorScreenshot";
import { decodeHookResult } from "../lib/decodeHookResult";

import { OnlyHookErrors } from "../types";

import { BaseManager } from "./_BaseManager";

type SlicesManagerReadSliceLibraryReturnType = {
	sliceIDs: string[] | undefined;
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
	model: CustomTypes.Widgets.Slices.SharedSlice | undefined;
	errors: (DecodeError | HookError)[];
};

type SliceMachineManagerPushSliceArgs = {
	libraryID: string;
	sliceID: string;
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

type SliceMachineManagerCaptureSliceScreenshotArgs = {
	libraryID: string;
	sliceID: string;
	variationID: string;
	viewport?: Viewport;
};

type SliceMachineManagerCaptureSliceScreenshotReturnType = {
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
			sliceIDs: data[0]?.sliceIDs,
			errors,
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
		res.errors = [...res.errors, ...errors];

		if (sliceIDs) {
			for (const sliceID of sliceIDs) {
				const { model, errors } = await this.readSlice({
					libraryID: args.libraryID,
					sliceID,
				});
				res.errors = [...res.errors, ...errors];

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
			res.errors = [...res.errors, ...errors];

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
	 * @returns Record of uploaded screenshot URLs.
	 */
	async pushSlice(
		args: SliceMachineManagerPushSliceArgs,
	): Promise<Record<string, string | undefined>> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		// TODO: Handle errors
		const { model } = await this.readSlice({
			libraryID: args.libraryID,
			sliceID: args.sliceID,
		});

		if (model) {
			const authenticationToken = await this.user.getAuthenticationToken();
			const sliceMachineConfig = await this.project.getSliceMachineConfig();

			// TODO: Create a single shared client.
			const client = prismicCustomTypesClient.createClient({
				repositoryName: sliceMachineConfig.repositoryName,
				token: authenticationToken,
				fetch,
			});

			try {
				// Check if Slice already exists on the repository.
				await client.getSharedSliceByID(args.sliceID);

				// If it exists on the repository, update it.
				await client.updateSharedSlice(model);
			} catch (error) {
				if (error instanceof prismicCustomTypesClient.NotFoundError) {
					// If the Slice doesn't exist on the repository, insert it.
					await client.insertSharedSlice(model);
				} else {
					throw error;
				}
			}
		}

		// TODO: Handle uploading screenshots to S3 and return URLs for each.

		return {};
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
			errors,
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

	async captureSliceScreenshot(
		args: SliceMachineManagerCaptureSliceScreenshotArgs,
	): Promise<SliceMachineManagerCaptureSliceScreenshotReturnType> {
		const projectConfig = await this.project.getSliceMachineConfig();

		const { data } = await captureSliceSimulatorScreenshot({
			sliceID: args.sliceID,
			libraryID: args.libraryID,
			variationID: args.variationID,
			projectConfig,
			viewport: args.viewport,
		});

		return {
			data,
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
			repositoryName: sliceMachineConfig.repositoryName,
			token: authenticationToken,
			fetch,
		});

		return await client.getAllSharedSlices();
	}
}
