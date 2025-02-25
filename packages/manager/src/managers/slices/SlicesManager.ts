import fs from "node:fs";
import * as t from "io-ts";
import OpenAI from "openai";
import * as prismicCustomTypesClient from "@prismicio/custom-types-client";
import { SharedSliceContent } from "@prismicio/types-internal/lib/content";
import { SliceComparator } from "@prismicio/types-internal/lib/customtypes/diff";
import {
	CompositeSlice,
	LegacySlice,
	SharedSlice,
	Variation,
} from "@prismicio/types-internal/lib/customtypes";
import {
	CallHookReturnType,
	HookError,
	SliceAssetUpdateHook,
	SliceCreateHook,
	SliceCreateHookData,
	SliceLibraryReadHookData,
	SliceReadHookData,
	SliceRenameHook,
	SliceRenameHookData,
	SliceUpdateHook,
} from "@slicemachine/plugin-kit";
import path from "node:path";
import { ChatCompletionMessageParam } from "openai/resources";

import { DecodeError } from "../../lib/DecodeError";
import { assertPluginsInitialized } from "../../lib/assertPluginsInitialized";
import { bufferCodec } from "../../lib/bufferCodec";
import { decodeHookResult } from "../../lib/decodeHookResult";
import { createContentDigest } from "../../lib/createContentDigest";
import { mockSlice } from "../../lib/mockSlice";
import fetch from "../../lib/fetch";

import { OnlyHookErrors } from "../../types";
import { DEFAULT_SLICE_SCREENSHOT_URL } from "../../constants/DEFAULT_SLICE_SCREENSHOT_URL";
import { SLICE_MACHINE_USER_AGENT } from "../../constants/SLICE_MACHINE_USER_AGENT";
import { API_ENDPOINTS } from "../../constants/API_ENDPOINTS";
import { UnauthenticatedError, UnauthorizedError } from "../../errors";

import { BaseManager } from "../BaseManager";
import {
	BedrockRuntimeClient,
	ConverseCommand,
	Message,
} from "@aws-sdk/client-bedrock-runtime";
import puppeteer from "puppeteer";

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

type SliceMachineManagerUpdateSliceArgs = {
	libraryID: string;
	model: SharedSlice;
	mocks?: SharedSliceContent[];
};

type SliceMachineManagerReadAllSlicesForLibraryReturnType = {
	models: { model: SharedSlice }[];
	errors: (DecodeError | HookError)[];
};

type SliceMachineManagerReadAllSlicesReturnType = {
	models: {
		libraryID: string;
		model: SharedSlice;
	}[];
	errors: (DecodeError | HookError)[];
};

type SliceMachineManagerReadSliceReturnType = {
	model: SharedSlice | undefined;
	errors: (DecodeError | HookError)[];
};

type SliceMachineManagerPushSliceArgs = {
	libraryID: string;
	sliceID: string;
	userAgent?: string;
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

type SliceMachineManagerDeleteSliceScreenshotArgs = {
	libraryID: string;
	sliceID: string;
	variationID: string;
};

type SliceMachineManagerReadSliceMocksArgs = {
	libraryID: string;
	sliceID: string;
};

type SliceMachineManagerReadSliceMocksReturnType = {
	mocks?: SharedSliceContent[];
	errors: (DecodeError | HookError)[];
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

type SliceMachineManagerUpdateSliceMocksArgs = {
	libraryID: string;
	sliceID: string;
	mocks: SharedSliceContent[];
};

type SliceMachineManagerUpdateSliceMocksArgsReturnType = {
	errors: HookError[];
};

type SlicesManagerUpsertHostedSliceScrenshotsArgs = {
	libraryID: string;
	model: SharedSlice;
};

type SliceMachineManagerDeleteSliceArgs = {
	libraryID: string;
	sliceID: string;
};

type SliceMachineManagerDeleteSliceReturnType = {
	errors: (DecodeError | HookError)[];
};

type SliceMachineManagerRenameSliceVariationArgs = {
	libraryID: string;
	sliceID: string;
	/**
	 * Current ID of the variation to rename.
	 */
	variationID: string;
	model: Variation;
};

type SliceMachineManagerRenameSliceVariationReturnType = {
	errors: (DecodeError | HookError)[];
	assetsErrors: (DecodeError | HookError)[];
};

type SliceMachineManagerDeleteSliceVariationArgs = {
	libraryID: string;
	sliceID: string;
	variationID: string;
};

type SliceMachineManagerDeleteSliceVariationReturnType = {
	errors: (DecodeError | HookError)[];
	assetsErrors: (DecodeError | HookError)[];
};

type SliceMachineManagerConvertLegacySliceToSharedSliceArgs = {
	model: CompositeSlice | LegacySlice;
	src: {
		customTypeID: string;
		tabID: string;
		sliceZoneID: string;
		sliceID: string;
	};
	dest: {
		libraryID: string;
		sliceID: string;
		variationName: string;
		variationID: string;
	};
};

type SliceMachineManagerConvertLegacySliceToSharedSliceReturnType = {
	errors: (DecodeError | HookError)[];
};

type SliceMachineManagerGenerateSliceArgs = {
	libraryID: string;
	slice: SharedSlice;
	imageFile: Uint8Array;
};

type SliceMachineManagerGenerateSliceReturnType = {
	slice?: SharedSlice;
};

type SliceMachineManagerGenerateSlicesFromUrlArgs = {
	websiteUrl: string;
};

type SliceMachineManagerGenerateSlicesFromUrlReturnType = {
	slices: SharedSlice[];
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

		console.log(
			`component code to create NOW for ${args.model.name}:`,
			JSON.stringify(args),
		);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"slice:create",
			args,
		);

		const updateSliceMocksArgs: SliceMachineManagerUpdateSliceMocksArgs = {
			libraryID: args.libraryID,
			sliceID: args.model.id,
			mocks: mockSlice({ model: args.model }),
		};

		const { errors: updateSliceHookErrors } =
			await this.updateSliceMocks(updateSliceMocksArgs);

		return {
			errors: [...hookResult.errors, ...updateSliceHookErrors],
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
		args: SliceMachineManagerUpdateSliceArgs,
	): Promise<OnlyHookErrors<CallHookReturnType<SliceUpdateHook>>> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const { mocks: previousMocks } = await this.readSliceMocks({
			libraryID: args.libraryID,
			sliceID: args.model.id,
		});
		const { model: previousModel } = await this.readSlice({
			libraryID: args.libraryID,
			sliceID: args.model.id,
		});
		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"slice:update",
			args,
		);

		const updatedMocks = mockSlice({
			model: args.model,
			mocks: previousMocks,
			diff: SliceComparator.compare(previousModel, args.model),
		});
		const updateSliceMocksArgs: SliceMachineManagerUpdateSliceMocksArgs = {
			libraryID: args.libraryID,
			sliceID: args.model.id,
			mocks: updatedMocks,
		};

		const { errors: updateSliceMocksHookResult } =
			await this.updateSliceMocks(updateSliceMocksArgs);

		return {
			errors: [...hookResult.errors, ...updateSliceMocksHookResult],
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

	async deleteSlice(
		args: SliceMachineManagerDeleteSliceArgs,
	): Promise<SliceMachineManagerDeleteSliceReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const { model, errors: readSliceErrors } = await this.readSlice({
			libraryID: args.libraryID,
			sliceID: args.sliceID,
		});

		if (model) {
			const { errors: deleteSliceErrors } =
				await this.sliceMachinePluginRunner.callHook("slice:delete", {
					model,
					libraryID: args.libraryID,
				});

			// Do not update custom types if slice deletion failed
			if (deleteSliceErrors.length > 0) {
				return {
					errors: deleteSliceErrors,
				};
			}

			const { errors: updateCustomTypeErrors } =
				await this._removeSliceFromCustomTypes(args.sliceID);

			return {
				errors: updateCustomTypeErrors,
			};
		} else {
			return {
				errors: readSliceErrors,
			};
		}
	}

	async renameSliceVariation(
		args: SliceMachineManagerRenameSliceVariationArgs,
	): Promise<SliceMachineManagerRenameSliceVariationReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

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
			const updateSliceHookResult =
				await this.sliceMachinePluginRunner.callHook("slice:update", {
					libraryID: args.libraryID,
					model: updatedModel,
				});

			// If variation ID has changed, we need to rename assets accordingly
			const assetsErrors: (DecodeError<unknown> | HookError<unknown>)[] = [];
			if (args.variationID !== args.model.id) {
				// Renaming screenshot
				const { data: screenshot, errors: readSliceScreenshotErrors } =
					await this.readSliceScreenshot({
						libraryID: args.libraryID,
						sliceID: args.sliceID,
						variationID: args.variationID,
					});
				assetsErrors.push(...readSliceScreenshotErrors);

				if (screenshot) {
					// Delete old ID screenshot
					const { errors: deleteSliceScreenshotErrors } =
						await this.deleteSliceScreenshot({
							libraryID: args.libraryID,
							sliceID: args.sliceID,
							variationID: args.variationID,
						});
					assetsErrors.push(...deleteSliceScreenshotErrors);

					// Create new ID screenshot
					const { errors: updateSliceScreenshotErrors } =
						await this.updateSliceScreenshot({
							libraryID: args.libraryID,
							sliceID: args.sliceID,
							variationID: args.model.id,
							data: screenshot,
						});
					assetsErrors.push(...updateSliceScreenshotErrors);
				}

				// Renaming mocks
				const { mocks, errors: readSliceMocksErrors } =
					await this.readSliceMocks({
						libraryID: args.libraryID,
						sliceID: args.sliceID,
					});
				assetsErrors.push(...readSliceMocksErrors);

				if (mocks?.length) {
					const { errors: updateSliceMocksErrors } =
						await this.updateSliceMocks({
							libraryID: args.libraryID,
							sliceID: args.sliceID,
							mocks: mocks.map((mock) => {
								if (mock.variation === args.variationID) {
									return {
										...mock,
										variation: args.model.id,
									};
								}

								return mock;
							}),
						});
					assetsErrors.push(...updateSliceMocksErrors);
				}
			}

			return {
				errors: updateSliceHookResult.errors,
				assetsErrors,
			};
		} else {
			return {
				errors: readSliceErrors,
				assetsErrors: [],
			};
		}
	}

	async deleteSliceVariation(
		args: SliceMachineManagerDeleteSliceVariationArgs,
	): Promise<SliceMachineManagerDeleteSliceVariationReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

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
			const updateSliceHookResult =
				await this.sliceMachinePluginRunner.callHook("slice:update", {
					libraryID: args.libraryID,
					model: updatedModel,
				});

			// Cleanup deleted variation screenshot
			const { errors: deleteSliceScreenshotErrors } =
				await this.deleteSliceScreenshot(args);

			// Cleanup deleted variation mocks
			const { mocks, errors: readSliceMocksErrors } = await this.readSliceMocks(
				{
					libraryID: args.libraryID,
					sliceID: args.sliceID,
				},
			);
			let updateSliceMocksErrors: SliceMachineManagerUpdateSliceMocksArgsReturnType["errors"] =
				[];
			if (mocks?.length) {
				updateSliceMocksErrors = (
					await this.updateSliceMocks({
						libraryID: args.libraryID,
						sliceID: args.sliceID,
						mocks: mocks.filter((mock) => mock.variation !== args.variationID),
					})
				).errors;
			}

			return {
				errors: updateSliceHookResult.errors,
				assetsErrors: [
					...deleteSliceScreenshotErrors,
					...readSliceMocksErrors,
					...updateSliceMocksErrors,
				],
			};
		} else {
			return {
				errors: readSliceErrors,
				assetsErrors: [],
			};
		}
	}

	async convertLegacySliceToSharedSlice(
		args: SliceMachineManagerConvertLegacySliceToSharedSliceArgs,
	): Promise<SliceMachineManagerConvertLegacySliceToSharedSliceReturnType> {
		const errors: (DecodeError | HookError)[] = [];

		const { model: maybeExistingSlice } = await this.readSlice({
			libraryID: args.dest.libraryID,
			sliceID: args.dest.sliceID,
		});

		const legacySliceAsVariation: Variation = {
			id: args.dest.variationID,
			name: args.dest.variationName,
			description: args.dest.variationName,
			imageUrl: "",
			docURL: "",
			version: "initial",
			primary: {},
			items: {},
		};

		switch (args.model.type) {
			case "Slice":
				legacySliceAsVariation.primary = args.model["non-repeat"];
				legacySliceAsVariation.items = args.model.repeat;
				break;

			case "Group":
				legacySliceAsVariation.items = args.model.config?.fields ?? {};
				break;

			default:
				legacySliceAsVariation.primary = { [args.src.sliceID]: args.model };
				break;
		}

		// Convert as a slice variation, or merge against an existing slice variation
		if (maybeExistingSlice) {
			const maybeVariation = maybeExistingSlice.variations.find(
				(variation) => variation.id === args.dest.variationID,
			);

			// If we're not merging against an existing slice variation, then we need to insert the new variation
			if (!maybeVariation) {
				maybeExistingSlice.variations = [
					...maybeExistingSlice.variations,
					legacySliceAsVariation,
				];
			}

			maybeExistingSlice.legacyPaths ||= {};
			maybeExistingSlice.legacyPaths[
				`${args.src.customTypeID}::${args.src.sliceZoneID}::${args.src.sliceID}`
			] = args.dest.variationID;

			await this.updateSlice({
				libraryID: args.dest.libraryID,
				model: maybeExistingSlice,
			});
		} else {
			// Convert to new shared slice
			await this.createSlice({
				libraryID: args.dest.libraryID,
				model: {
					id: args.dest.sliceID,
					type: "SharedSlice",
					name: args.dest.sliceID,
					legacyPaths: {
						[`${args.src.customTypeID}::${args.src.sliceZoneID}::${args.src.sliceID}`]:
							args.dest.variationID,
					},
					variations: [legacySliceAsVariation],
				},
			});
		}

		// Update source custom type
		const { model: customType, errors: customTypeReadErrors } =
			await this.customTypes.readCustomType({
				id: args.src.customTypeID,
			});
		errors.push(...customTypeReadErrors);

		if (customType) {
			const field = customType.json[args.src.tabID][args.src.sliceZoneID];

			// Convert legacy slice definition in slice zone to shared slice reference
			if (field.type === "Slices" && field.config?.choices) {
				delete field.config.choices[args.src.sliceID];
				field.config.choices[args.dest.sliceID] = {
					type: "SharedSlice",
				};
			}

			const { errors: customTypeUpdateErrors } =
				await this.customTypes.updateCustomType({ model: customType });
			errors.push(...customTypeUpdateErrors);
		}

		return { errors };
	}

	/**
	 * @returns Record of variation IDs mapped to uploaded screenshot URLs.
	 */
	async pushSlice(
		args: SliceMachineManagerPushSliceArgs,
	): Promise<SliceMachineManagerPushSliceReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		if (!(await this.user.checkIsLoggedIn())) {
			throw new UnauthenticatedError();
		}

		const { model, errors: readSliceErrors } = await this.readSlice({
			libraryID: args.libraryID,
			sliceID: args.sliceID,
		});

		if (model) {
			const modelWithScreenshots =
				await this.updateSliceModelScreenshotsInPlace({
					libraryID: args.libraryID,
					model,
				});

			const authenticationToken = await this.user.getAuthenticationToken();
			const repositoryName = await this.project.getResolvedRepositoryName();

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
				errors: readSliceErrors,
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

	async deleteSliceScreenshot(
		args: SliceMachineManagerDeleteSliceScreenshotArgs,
	): Promise<OnlyHookErrors<CallHookReturnType<SliceAssetUpdateHook>>> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"slice:asset:delete",
			{
				libraryID: args.libraryID,
				sliceID: args.sliceID,
				assetID: `screenshot-${args.variationID}.png`,
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
		const { data, errors } = decodeHookResult(
			t.type({
				data: t.array(SharedSliceContent),
			}),
			{
				...hookResult,
				// Convert the asset data from a Buffer to JSON
				// to prepare it for validation.
				data: hookResult.data.map((result) => {
					try {
						return {
							...result,
							data: JSON.parse(result.data.toString()),
						};
					} catch {
						return result;
					}
				}),
			},
		);

		if (data) {
			return {
				mocks: data[0]?.data,
				errors,
			};
		} else {
			return {
				mocks: [],
				errors,
			};
		}
	}

	async updateSliceMocks(
		args: SliceMachineManagerUpdateSliceMocksArgs,
	): Promise<SliceMachineManagerUpdateSliceMocksArgsReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"slice:asset:update",
			{
				libraryID: args.libraryID,
				sliceID: args.sliceID,
				asset: {
					id: "mocks.json",
					data: Buffer.from(JSON.stringify(args.mocks, null, "\t")),
				},
			},
		);

		return {
			errors: hookResult.errors,
		};
	}

	// TODO: Remove
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

	async fetchRemoteSlices(): Promise<SharedSlice[]> {
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

		return await client.getAllSharedSlices();
	}

	async updateSliceModelScreenshotsInPlace(
		args: SlicesManagerUpsertHostedSliceScrenshotsArgs,
	): Promise<SharedSlice> {
		const repositoryName = await this.project.getResolvedRepositoryName();

		const variations = await Promise.all(
			args.model.variations.map(async (variation) => {
				const screenshot = await this.readSliceScreenshot({
					libraryID: args.libraryID,
					sliceID: args.model.id,
					variationID: variation.id,
				});

				// If there's no screenshot, delete it by replacing it with the default screenshot
				if (!screenshot.data) {
					return {
						...variation,
						imageUrl: DEFAULT_SLICE_SCREENSHOT_URL,
					};
				}

				const hasScreenshotChanged = !variation.imageUrl?.includes(
					createContentDigest(screenshot.data),
				);

				// If screenshot hasn't changed, do nothing
				if (!hasScreenshotChanged) {
					return variation;
				}

				const keyPrefix = [
					repositoryName,
					"shared-slices",
					args.model.id,
					variation.id,
				].join("/");

				const uploadedScreenshot = await this.screenshots.uploadScreenshot({
					data: screenshot.data,
					keyPrefix,
				});

				return {
					...variation,
					imageUrl: uploadedScreenshot.url,
				};
			}),
		);

		return {
			...args.model,
			variations,
		};
	}

	private async _removeSliceFromCustomTypes(sliceID: string) {
		const { models, errors: customTypeReadErrors } =
			await this.customTypes.readAllCustomTypes();

		// Successfully update all custom types or throw
		await Promise.all(
			models.map(async (customType) => {
				const updatedJsonModel = Object.entries(customType.model.json).reduce(
					(tabAccumulator, [tabKey, tab]) => {
						const updatedTabFields = Object.entries(tab).reduce(
							(fieldAccumulator, [fieldKey, field]) => {
								if (
									field.config === undefined ||
									field.type !== "Slices" ||
									field.config.choices === undefined
								) {
									return { ...fieldAccumulator, [fieldKey]: field };
								}

								const filteredChoices = Object.entries(
									field.config.choices,
								).reduce((choiceAccumulator, [choiceKey, choice]) => {
									if (choiceKey === sliceID) {
										return choiceAccumulator;
									}

									return { ...choiceAccumulator, [choiceKey]: choice };
								}, {});

								return {
									...fieldAccumulator,
									[fieldKey]: {
										...field,
										config: { ...field.config, choices: filteredChoices },
									},
								};
							},
							{},
						);

						return { ...tabAccumulator, [tabKey]: updatedTabFields };
					},
					{},
				);

				await this.customTypes.updateCustomType({
					model: { ...customType.model, json: updatedJsonModel },
				});
			}),
		);

		return { errors: customTypeReadErrors };
	}

	async generateSlice(
		args: SliceMachineManagerGenerateSliceArgs,
	): Promise<SliceMachineManagerGenerateSliceReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const INPUT_TOKEN_PRICE = 0.000003;
		const OUTPUT_TOKEN_PRICE = 0.000015;

		let totalTokens = {
			modelGeneration: {
				input: 0,
				output: 0,
				total: 0,
				price: 0,
			},
			mocksGeneration: {
				input: 0,
				output: 0,
				total: 0,
				price: 0,
			},
			codeGeneration: {
				input: 0,
				output: 0,
				total: 0,
				price: 0,
			},
		};

		// Validate AWS credentials
		const AWS_REGION = "us-east-1";
		const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env;
		if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
			throw new Error("AWS credentials are not set.");
		}

		/**
		 * TypeScript schema for the Shared Slice definition.
		 */
		const SHARED_SLICE_SCHEMA = `
/**
 * Represents a Prismic Slice.
 * @property {string} type - Should always be "SharedSlice".
 * @property {string} id - Unique identifier for the slice in snake_case.
 * @property {string} name - Human-readable name in PascalCase.
 * @property {string} description - Brief explanation of the slice's purpose.
 * @property {SliceVariation[]} variations - Array of variations for the slice.
 */
type PrismicSlice = {
  type: "SharedSlice";
  id: string;
  name: string;
  description: string;
  variations: SliceVariation[];
};

/**
 * Represents a variation of a Prismic Slice.
 */
type SliceVariation = {
  id: string;
  name: string;
  description: string;
  primary: Record<string, PrismicField>;
  docURL: string;
  version: string;
};

/**
 * Union type representing all possible Prismic fields.
 */
type PrismicField =
  | UIDField
  | BooleanField
  | ColorField
  | DateField
  | TimestampField
  | NumberField
  | KeyTextField
  | SelectField
  | StructuredTextField
  | ImageField
  | LinkField
  | GeoPointField
  | EmbedField
  | GroupField;

/* Definitions for each field type follow... */

/**
 * Represents a UID Field in Prismic.
 * @property {"UID"} type - Field type.
 * @property {Object} config - Configuration object.
 * @property {string} config.label - Label displayed in the editor.
 * @property {string} [config.placeholder] - Placeholder text.
 * @property {string} [config.customregex] - Custom regex for validation.
 * @property {string} [config.errorMessage] - Error message for invalid input.
 */
type UIDField = {
	type: "UID";
	config: {
		label: string;
		placeholder?: string;
		customregex?: string;
		errorMessage?: string;
	};
};

/**
 * Represents a Boolean Field in Prismic.
 * @property {"Boolean"} type - Field type.
 * @property {Object} config - Configuration object.
 * @property {string} config.label - Label displayed in the editor.
 * @property {boolean} [config.default_value] - Default value (true or false).
 */
type BooleanField = {
	type: "Boolean";
	config: {
		label: string;
		default_value?: boolean;
	};
};

/**
 * Represents a Color Field in Prismic.
 * @property {"Color"} type - Field type.
 * @property {Object} config - Configuration object.
 * @property {string} config.label - Label displayed in the editor.
 */
type ColorField = {
	type: "Color";
	config: {
		label: string;
	};
};

/**
 * Represents a Date Field in Prismic.
 * @property {"Date"} type - Field type.
 * @property {Object} config - Configuration object.
 * @property {string} config.label - Label displayed in the editor.
 */
type DateField = {
	type: "Date";
	config: {
		label: string;
	};
};

/**
 * Represents a Timestamp Field in Prismic.
 * @property {"Timestamp"} type - Field type.
 * @property {Object} config - Configuration object.
 * @property {string} config.label - Label displayed in the editor.
 */
type TimestampField = {
	type: "Timestamp";
	config: {
		label: string;
	};
};

/**
 * Represents a Number Field in Prismic.
 * @property {"Number"} type - Field type.
 * @property {Object} config - Configuration object.
 * @property {string} config.label - Label displayed in the editor.
 * @property {string} [config.placeholder] - Placeholder text.
 * @property {number} [config.min] - Minimum allowable value.
 * @property {number} [config.max] - Maximum allowable value.
 */
type NumberField = {
	type: "Number";
	config: {
		label: string;
		placeholder?: string;
		min?: number;
		max?: number;
	};
};

/**
 * Represents a Key Text Field in Prismic.
 * @property {"Text"} type - Field type.
 * @property {Object} config - Configuration object.
 * @property {string} config.label - Label displayed in the editor.
 * @property {string} [config.placeholder] - Placeholder text.
 */
type KeyTextField = {
	type: "Text";
	config: {
		label: string;
		placeholder?: string;
	};
};

/**
 * Represents a Select Field in Prismic.
 * @property {"Select"} type - Field type.
 * @property {Object} config - Configuration object.
 * @property {string} config.label - Label displayed in the editor.
 * @property {string[]} config.options - Array of options for the select dropdown.
 */
type SelectField = {
	type: "Select";
	config: {
		label: string;
		options: string[];
	};
};

/**
 * Represents a Structured Text Field in Prismic.
 * @property {"StructuredText"} type - Field type.
 * @property {Object} config - Configuration object.
 * @property {string} config.label - Label displayed in the editor.
 * @property {string} [config.placeholder] - Placeholder text.
 * @property {string} [config.single] - A comma-separated list of formatting options that does not allow line breaks. Options: paragraph | preformatted | heading1 | heading2 | heading3 | heading4 | heading5 | heading6 | strong | em | hyperlink | image | embed | list-item | o-list-item | rtl.
 * @property {string} [config.multi] - A comma-separated list of formatting options, with paragraph breaks allowed. Options: paragraph | preformatted | heading1 | heading2 | heading3 | heading4 | heading5 | heading6 | strong | em | hyperlink | image | embed | list-item | o-list-item | rtl.
 * @property {boolean} [config.allowTargetBlank] - Allows links to open in a new tab.
 * @property {string[]} [config.labels] - An array of strings to define labels for custom formatting.
 * @property {ImageConstraint} [config.imageConstraint] - Constraints for images within the rich text field.
 */
type StructuredTextField = {
	type: "StructuredText";
	config: {
		label: string;
		placeholder?: string;
		single?: string;
		multi?: string;
		allowTargetBlank?: boolean;
		labels?: string[];
		imageConstraint?: ImageConstraint;
	};
};

/**
 * Represents constraints for images within a rich text field.
 * @property {number} [width] - Width constraint in pixels.
 * @property {number
 * @property {number} [height] - Height constraint in pixels.
 */
type ImageConstraint = {
	width?: number;
	height?: number;
};

/**
 * Represents an Image Field in Prismic.
 * @property {"Image"} type - Field type.
 * @property {Object} config - Configuration object.
 * @property {string} config.label - Label displayed in the editor.
 * @property {Object} [config.constraint] - Constraints for the image dimensions.
 * @property {number} [config.constraint.width] - Width constraint.
 * @property {number} [config.constraint.height] - Height constraint.
 * @property {Thumbnail[]} [config.thumbnails] - Array of thumbnail configurations.
 */
type ImageField = {
	type: "Image";
	config: {
		label: string;
		constraint?: {
			width?: number;
			height?: number;
		};
		thumbnails?: Thumbnail[];
	};
};

/**
 * Represents a Thumbnail configuration for an Image field.
 * @property {string} name - Name of the thumbnail.
 * @property {number} [width] - Width of the thumbnail in pixels.
 * @property {number} [height] - Height of the thumbnail in pixels.
 */
type Thumbnail = {
	name: string;
	width?: number;
	height?: number;
};

/**
 * Represents a Link Field in Prismic.
 * @property {"Link"} type - Field type.
 * @property {Object} config - Configuration object.
 * @property {string} config.label - Label displayed in the editor.
* @property {boolean} config.allowText - Enable the text field for the link.
 */
type LinkField = {
	type: "Link";
	config: {
		label: string;
		allowText: boolean;
	};
};

/**
 * Represents an Embed Field in Prismic.
 * @property {"Embed"} type - Field type.
 * @property {Object} config - Configuration object.
 * @property {string} config.label - Label displayed in the editor.
 */
type EmbedField = {
	type: "Embed";
	config: {
		label: string;
	};
};

/**
 * Represents a GeoPoint Field in Prismic.
 * @property {"GeoPoint"} type - Field type.
 * @property {Object} config - Configuration object.
 * @property {string} config.label - Label displayed in the editor.
 */
type GeoPointField = {
	type: "GeoPoint";
	config: {
		label: string;
	};
};

/**
 * Represents a Group Field (Repeatable Fields) in Prismic.
 * @property {"Group"} type - Field type.
 * @property {Object} config - Configuration object.
 * @property {string} config.label - Label displayed in the editor.
 * @property {Record<string, PrismicField>} config.fields - Defines the fields inside the group.
 */
type GroupField = {
	type: "Group";
	config: {
		label: string;
		fields: Record<string, PrismicField>;
	};
};
`;

		/**
		 * Calls the AI to generate the slice model.
		 */
		async function generateSliceModel(
			client: BedrockRuntimeClient,
			existingSlice: SharedSlice,
			imageFile: Uint8Array,
		): Promise<SharedSlice> {
			const systemPrompt = `
				You are an expert in Prismic content modeling. Using the image provided, generate a valid Prismic JSON model for the slice described below. Follow these rules precisely:
				- Use the TypeScript schema provided as your reference.
				- Place all main content fields under the "primary" object.
				- Do not create any collections or groups for single-image content (background images should be a single image field).
				- Ensure that each field has appropriate placeholders, labels, and configurations.
				- Never generate a Link / Button text field, only the Link / Button field itself is enough. Just enable "allowText" when doing that.
				- Do not forget any field visible from the image provide in the user prompt.
				- Ensure to differentiate Prismic fields from just an image with visual inside the image. When that's the case, just add a Prismic image field.
				- Do not include any decorative fields.
				- Do not include any extra commentary or formatting.
	
				!IMPORTANT!: 
					- Only return a valid JSON object representing the full slice model, nothing else before. JSON.parse on your response should not throw an error.
					- All your response should fit in a single return response.

				Reference Schema:
				${SHARED_SLICE_SCHEMA}
				
				Existing Slice:
				${JSON.stringify(existingSlice)}
			`.trim();
			const command = new ConverseCommand({
				modelId: "us.anthropic.claude-3-5-sonnet-20241022-v2:0",
				system: [{ text: systemPrompt }],
				messages: [
					{
						role: "user",
						content: [
							{
								image: { format: "png", source: { bytes: imageFile } },
							},
						],
					},
				],
			});

			const response = await client.send(command);
			console.log("Generated model response:", JSON.stringify(response));

			if (
				!response.usage ||
				!response.usage.inputTokens ||
				!response.usage.outputTokens ||
				!response.usage.totalTokens
			) {
				throw new Error("No usage data was returned.");
			}
			totalTokens.modelGeneration = {
				input: response.usage.inputTokens,
				output: response.usage.outputTokens,
				total: response.usage.totalTokens,
				price:
					response.usage.inputTokens * INPUT_TOKEN_PRICE +
					response.usage.outputTokens * OUTPUT_TOKEN_PRICE,
			};

			const resultText = response.output?.message?.content?.[0]?.text?.trim();
			if (!resultText) {
				throw new Error("No valid slice model was generated.");
			}

			try {
				const generatedModel = JSON.parse(resultText);
				const updatedSlice: SharedSlice = {
					...args.slice,
					variations: generatedModel.variations,
				};

				return updatedSlice;
			} catch (error) {
				throw new Error("Failed to parse AI response for model: " + error);
			}
		}

		/**
		 * Calls the AI endpoint to generate mocks.
		 */
		async function generateSliceMocks(
			client: BedrockRuntimeClient,
			imageFile: Uint8Array,
			existingMocks: SharedSliceContent[],
		): Promise<SharedSliceContent[]> {
			// Build a prompt focused solely on updating the mocks.
			const systemPrompt = `
				You are a seasoned frontend engineer with deep expertise in Prismic slices.
				Your task is to update the provided mocks template based solely on the visible content in the image.
				Follow these guidelines strictly:
					- Do not modify the overall structure of the mocks template.
					- Strictly only update text content.
					- Do not touch images.
					- If you see a repetition with a group, you must create the same number of group items that are visible on the image.

				!IMPORTANT!: 
					- Only return a valid JSON object for mocks, nothing else before. JSON.parse on your response should not throw an error.
					- All your response should fit in a single return response.
				
				Existing Mocks Template:
				${JSON.stringify(existingMocks, null, 2)}
			`.trim();

			const command = new ConverseCommand({
				modelId: "us.anthropic.claude-3-5-sonnet-20241022-v2:0",
				system: [{ text: systemPrompt }],
				messages: [
					{
						role: "user",
						content: [
							{ image: { format: "png", source: { bytes: imageFile } } },
						],
					},
				],
			});

			const response = await client.send(command);
			console.log("Generated mocks response:", JSON.stringify(response));

			if (
				!response.usage ||
				!response.usage.inputTokens ||
				!response.usage.outputTokens ||
				!response.usage.totalTokens
			) {
				throw new Error("No usage data was returned.");
			}
			totalTokens.mocksGeneration = {
				input: response.usage.inputTokens,
				output: response.usage.outputTokens,
				total: response.usage.totalTokens,
				price:
					response.usage.inputTokens * INPUT_TOKEN_PRICE +
					response.usage.outputTokens * OUTPUT_TOKEN_PRICE,
			};

			const resultText = response.output?.message?.content?.[0]?.text?.trim();
			if (!resultText) {
				throw new Error("No valid mocks were generated.");
			}

			try {
				const updatedMocks = JSON.parse(resultText);

				return updatedMocks;
			} catch (error) {
				throw new Error("Failed to parse AI response for mocks: " + error);
			}
		}

		/**
		 * Calls the AI endpoint to generate the slice React component.
		 */
		async function generateSliceComponentCode(
			client: BedrockRuntimeClient,
			imageFile: Uint8Array,
			existingMocks: any,
		): Promise<string> {
			// Build a prompt focused solely on generating the React component code.
			const systemPrompt = `
				You are a seasoned frontend engineer with deep expertise in Prismic slices.
				Your task is to generate a fully isolated React component code for a slice based on the provided image input.
				Follow these guidelines strictly:
					- Be self-contained.
					- Your goal is to make the code visually looks as close as possible to the image from the user input.
					- Ensure that the color used for the background is the same as the image provide in the user prompt! It's better no background color than a wrong one.
					- For links, you must use PrismicNextLink and you must just pass the field, PrismicNextLink will handle the display of the link text, don't do it manually.
					- Respect the padding and margin visible in the image provide in the user prompt.
					- Respect the fonts size, color, type visible in the image provide in the user prompt.
					- Respect the colors visible in the image provide in the user prompt.
					- Respect the position of elements visible in the image provide in the user prompt.
					- Respect the size of each elements visible in the image provide in the user prompt.
					- Respect the overall proportions of the slice from the image provide in the user prompt.
					- Ensure to strictly respect what is defined on the mocks for each fields ID, do not invent or use something not in the mocks.
					- Ensure to use all fields provided in the mocks.
					- Use inline <style> (do not use <style jsx>).
					- Follow the structure provided in the code example below.

				!IMPORTANT!: 
					- Only return a valid JSON object with two keys: "mocks" and "componentCode", nothing else before. JSON.parse on your response should not throw an error.
					- All your response should fit in a single return response.
				
				## Example of a Fully Isolated Slice Component:
				-----------------------------------------------------------
				import { type Content } from "@prismicio/client";
				import { PrismicNextLink, PrismicNextImage } from "@prismicio/next";
				import { SliceComponentProps, PrismicRichText } from "@prismicio/react";
				
				export type HeroProps = SliceComponentProps<Content.HeroSlice>;
				
				const Hero = ({ slice }: HeroProps): JSX.Element => {
					return (
						<section
						data-slice-type={slice.slice_type}
						data-slice-variation={slice.variation}
						className="hero"
						>
						<div className="hero__content">
							<div className="hero__image-wrapper">
								<PrismicNextImage field={slice.primary.image} className="hero__image" />
							</div>
							<div className="hero__text">
								<PrismicRichText field={slice.primary.title} />
								<PrismicRichText field={slice.primary.description} />
								<PrismicNextLink field={slice.primary.link} />
							</div>
						</div>
						<style>
							{\`
								.hero { display: flex; flex-direction: row; padding: 20px; }
								.hero__content { width: 100%; }
								.hero__image-wrapper { flex: 1; }
								.hero__text { flex: 1; padding-left: 20px; }
							\`}
						</style>
						</section>
					);
				};
				
				export default Hero;
				-----------------------------------------------------------
				Existing Mocks Template:
				${JSON.stringify(existingMocks, null, 2)}
			`.trim();

			const command = new ConverseCommand({
				modelId: "us.anthropic.claude-3-5-sonnet-20241022-v2:0",
				system: [{ text: systemPrompt }],
				messages: [
					{
						role: "user",
						content: [
							{ image: { format: "png", source: { bytes: imageFile } } },
						],
					},
				],
			});

			const response = await client.send(command);
			console.log(
				"Generated component code response:",
				JSON.stringify(response),
			);

			if (
				!response.usage ||
				!response.usage.inputTokens ||
				!response.usage.outputTokens ||
				!response.usage.totalTokens
			) {
				throw new Error("No usage data was returned.");
			}
			totalTokens.codeGeneration = {
				input: response.usage.inputTokens,
				output: response.usage.outputTokens,
				total: response.usage.totalTokens,
				price:
					response.usage.inputTokens * INPUT_TOKEN_PRICE +
					response.usage.outputTokens * OUTPUT_TOKEN_PRICE,
			};

			const resultText = response.output?.message?.content?.[0]?.text?.trim();
			if (!resultText) {
				throw new Error("No valid slice component code was generated.");
			}

			try {
				const parsed = JSON.parse(resultText);
				if (!parsed.componentCode) {
					throw new Error("Missing key 'componentCode' in AI response.");
				}
				return parsed.componentCode;
			} catch (error) {
				throw new Error(
					"Failed to parse AI response for component code: " + error,
				);
			}
		}

		// Initialize AWS Bedrock client.
		const bedrockClient = new BedrockRuntimeClient({
			region: AWS_REGION,
			credentials: {
				accessKeyId: AWS_ACCESS_KEY_ID,
				secretAccessKey: AWS_SECRET_ACCESS_KEY,
			},
		});

		try {
			// ----- Q1 scope -----

			// STEP 1: Generate the slice model using the image.
			console.log("STEP 1: Generate the slice model using the image.");
			const updatedSlice = await generateSliceModel(
				bedrockClient,
				args.slice,
				args.imageFile,
			);

			// STEP 2: Persist the updated slice model.
			console.log("STEP 2: Persist the updated slice model.");
			await this.updateSlice({
				libraryID: args.libraryID,
				model: updatedSlice,
			});

			// STEP 3: Update the slice screenshot.
			console.log("STEP 3: Update the slice screenshot.");
			await this.updateSliceScreenshot({
				libraryID: args.libraryID,
				sliceID: updatedSlice.id,
				variationID: updatedSlice.variations[0].id,
				data: Buffer.from(args.imageFile),
			});

			// ----- Q1 scope -----

			// STEP 4: Generate updated mocks.
			console.log("STEP 4: Generate updated mocks.");
			const existingMocks = mockSlice({ model: updatedSlice });
			const updatedMocks = await generateSliceMocks(
				bedrockClient,
				args.imageFile,
				existingMocks,
			);

			// STEP 5: Generate the isolated slice component code.
			console.log("STEP 5: Generate updated component code.");
			const componentCode = await generateSliceComponentCode(
				bedrockClient,
				args.imageFile,
				existingMocks,
			);

			// STEP 6: Update the slice code.
			console.log("STEP 6: Update the slice code.");
			await this.createSlice({
				libraryID: args.libraryID,
				model: updatedSlice,
				componentContents: componentCode,
			});

			// STEP 7: Persist the generated mocks.
			console.log("STEP 7: Persist the generated mocks.");
			await this.updateSliceMocks({
				libraryID: args.libraryID,
				sliceID: args.slice.id,
				mocks: updatedMocks,
			});

			// Usage
			console.log("Tokens used:", totalTokens);
			const totalPrice = Object.values(totalTokens).reduce(
				(acc, { price }) => acc + price,
				0,
			);
			console.log("Total price:", totalPrice);

			return { slice: updatedSlice };
		} catch (error) {
			console.error("Failed to generate slice:", error);
			throw new Error("Failed to generate slice: " + error);
		}
	}

	async generateSlicesFromUrl(
		args: SliceMachineManagerGenerateSlicesFromUrlArgs,
	): Promise<SliceMachineManagerGenerateSlicesFromUrlReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const { OPENAI_API_KEY, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } =
			process.env;

		if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
			throw new Error("AWS credentials are not set.");
		}
		const AWS_REGION = "us-east-1";
		const bedrockClient = new BedrockRuntimeClient({
			region: AWS_REGION,
			credentials: {
				accessKeyId: AWS_ACCESS_KEY_ID,
				secretAccessKey: AWS_SECRET_ACCESS_KEY,
			},
		});

		if (!OPENAI_API_KEY) {
			throw new Error("OPENAI_API_KEY is not set.");
		}
		const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

		const sliceMachineConfig = await this.project.getSliceMachineConfig();
		const libraryIDs = sliceMachineConfig.libraries || [];
		const DEFAULT_LIBRARY_ID = libraryIDs[0];

		const KNOWNED_WEBSITE_URLS: { [url: string]: string } = {
			"https://www.criteo.com/": "./resources/criteo/homepage",
			"https://www.brevo.com/landing/email-marketing-service/":
				"./resources/brevo/mail",
		};

		async function readImagesFromFolder(
			folderPath: string,
		): Promise<Uint8Array[]> {
			console.log(process.cwd());

			const files = await fs.promises.readdir(folderPath);
			const images = await Promise.all(
				files.map(async (file) => {
					const buffer = await fs.promises.readFile(
						path.join(folderPath, file),
					);
					return new Uint8Array(buffer);
				}),
			);

			return images;
		}

		async function readCodeFromFolder(folderPath: string): Promise<string[]> {
			const files = await fs.promises.readdir(folderPath);
			const codes = await Promise.all(
				files.map(async (file) => {
					const buffer = await fs.promises.readFile(
						path.join(folderPath, file),
						"utf-8",
					);
					return buffer.toString();
				}),
			);

			return codes;
		}

		async function getGlobalStyle(filePath: string): Promise<string> {
			const buffer = await fs.promises
				.readFile(filePath)
				.catch(() => Buffer.from(""));

			return buffer.toString();
		}

		async function callAI<ReturnType extends Record<string, unknown>>({
			ai,
			stepName,
			systemPrompt,
			imageFile,
			textContent,
		}: {
			ai: "OPENAI" | "AWS";
			stepName: string;
			systemPrompt: string;
			imageFile?: Uint8Array;
			textContent?: string;
		}): Promise<ReturnType> {
			let resultText: string | undefined;

			if (ai === "OPENAI") {
				const messages: Array<ChatCompletionMessageParam> = [
					{ role: "system", content: systemPrompt },
				];

				const userContent: Array<
					| {
							type: "text";
							text: string;
					  }
					| {
							type: "image_url";
							image_url: { url: string };
					  }
				> = [];

				if (imageFile) {
					userContent.push({
						type: "image_url",
						image_url: {
							url:
								"data:image/png;base64," +
								Buffer.from(imageFile).toString("base64"),
						},
					});
				}

				if (textContent) {
					userContent.push({ type: "text", text: textContent });
				}

				if (userContent.length > 0) {
					messages.push({
						role: "user",
						content: userContent,
					});
				}

				const response = await openai.chat.completions.create({
					model: "gpt-4o",
					messages,
					response_format: { type: "json_object" },
				});

				console.log(
					`Generated model response for ${stepName}:`,
					JSON.stringify(response),
				);

				resultText = response.choices[0]?.message?.content?.trim();
			} else if (ai === "AWS") {
				const messages: Array<Message> = [];

				if (imageFile) {
					messages.push({
						role: "user",
						content: [
							{
								image: { format: "png", source: { bytes: imageFile } },
							},
						],
					});
				}

				if (textContent) {
					messages.push({
						role: "user",
						content: [
							{
								text: textContent,
							},
						],
					});
				}

				const command = new ConverseCommand({
					modelId: "us.anthropic.claude-3-7-sonnet-20250219-v1:0",
					system: [{ text: systemPrompt }],
					messages: messages,
				});

				const response = await bedrockClient.send(command);

				console.log(
					`Generated model response for ${stepName}:`,
					JSON.stringify(response),
				);

				resultText = response.output?.message?.content?.[0]?.text?.trim();
			}

			if (!resultText) {
				throw new Error(`No valid response was generated for ${stepName}.`);
			}

			try {
				return JSON.parse(resultText);
			} catch (error) {
				throw new Error(
					`Failed to parse AI response for ${stepName}: ` + error,
				);
			}
		}

		/**
		 * TypeScript schema for the Shared Slice definition.
		 */
		const SHARED_SLICE_SCHEMA = `
/**
 * Represents a Prismic Slice.
 * @property {string} type - Should always be "SharedSlice".
 * @property {string} id - Unique identifier for the slice in snake_case.
 * @property {string} name - Human-readable name in PascalCase.
 * @property {string} description - Brief explanation of the slice's purpose.
 * @property {SliceVariation[]} variations - Array of variations for the slice.
 */
type PrismicSlice = {
  type: "SharedSlice";
  id: string;
  name: string;
  description: string;
  variations: SliceVariation[];
};

/**
 * Represents a variation of a Prismic Slice.
 * TIPS: Never use "items" property, you can see it doesn't exist here!
 */
type SliceVariation = {
  id: string;
  name: string;
  description: string;
  primary: Record<string, PrismicField>;
  docURL: string;
  version: string;
};

/**
 * Union type representing all possible Prismic fields.
 */
type PrismicField =
  | UIDField
  | BooleanField
  | ColorField
  | DateField
  | TimestampField
  | NumberField
  | TextField
  | SelectField
  | StructuredTextField
  | ImageField
  | LinkField
  | GeoPointField
  | EmbedField
  | GroupField;

/* Definitions for each field type follow... */

/**
 * Represents a UID Field in Prismic.
 * @property {"UID"} type - Field type.
 * @property {Object} config - Configuration object.
 * @property {string} config.label - Label displayed in the editor.
 * @property {string} [config.placeholder] - Placeholder text.
 * @property {string} [config.customregex] - Custom regex for validation.
 * @property {string} [config.errorMessage] - Error message for invalid input.
 */
type UIDField = {
	type: "UID";
	config: {
		label: string;
		placeholder?: string;
		customregex?: string;
		errorMessage?: string;
	};
};

/**
 * Represents a Boolean Field in Prismic.
 * @property {"Boolean"} type - Field type.
 * @property {Object} config - Configuration object.
 * @property {string} config.label - Label displayed in the editor.
 * @property {boolean} [config.default_value] - Default value (true or false).
 */
type BooleanField = {
	type: "Boolean";
	config: {
		label: string;
		default_value?: boolean;
	};
};

/**
 * Represents a Color Field in Prismic.
 * @property {"Color"} type - Field type.
 * @property {Object} config - Configuration object.
 * @property {string} config.label - Label displayed in the editor.
 */
type ColorField = {
	type: "Color";
	config: {
		label: string;
	};
};

/**
 * Represents a Date Field in Prismic.
 * @property {"Date"} type - Field type.
 * @property {Object} config - Configuration object.
 * @property {string} config.label - Label displayed in the editor.
 */
type DateField = {
	type: "Date";
	config: {
		label: string;
	};
};

/**
 * Represents a Timestamp Field in Prismic.
 * @property {"Timestamp"} type - Field type.
 * @property {Object} config - Configuration object.
 * @property {string} config.label - Label displayed in the editor.
 */
type TimestampField = {
	type: "Timestamp";
	config: {
		label: string;
	};
};

/**
 * Represents a Number Field in Prismic.
 * @property {"Number"} type - Field type.
 * @property {Object} config - Configuration object.
 * @property {string} config.label - Label displayed in the editor.
 * @property {string} [config.placeholder] - Placeholder text.
 * @property {number} [config.min] - Minimum allowable value.
 * @property {number} [config.max] - Maximum allowable value.
 */
type NumberField = {
	type: "Number";
	config: {
		label: string;
		placeholder?: string;
		min?: number;
		max?: number;
	};
};

/**
 * Represents a Text Field in Prismic.
 * @property {"Text"} type - Field type.
 * @property {Object} config - Configuration object.
 * @property {string} config.label - Label displayed in the editor.
 * @property {string} [config.placeholder] - Placeholder text.
 */
type TextField = {
	type: "Text";
	config: {
		label: string;
		placeholder?: string;
	};
};

/**
 * Represents a Select Field in Prismic.
 * @property {"Select"} type - Field type.
 * @property {Object} config - Configuration object.
 * @property {string} config.label - Label displayed in the editor.
 * @property {string[]} config.options - Array of options for the select dropdown.
 */
type SelectField = {
	type: "Select";
	config: {
		label: string;
		options: string[];
	};
};

/**
 * Represents a Structured Text Field in Prismic.
 * @property {"StructuredText"} type - Field type.
 * @property {Object} config - Configuration object.
 * @property {string} config.label - Label displayed in the editor.
 * @property {string} [config.placeholder] - Placeholder text.
 * @property {string} [config.single] - A comma-separated list of formatting options that does not allow line breaks. Options: paragraph | preformatted | heading1 | heading2 | heading3 | heading4 | heading5 | heading6 | strong | em | hyperlink | image | embed | list-item | o-list-item | rtl.
 * @property {string} [config.multi] - A comma-separated list of formatting options, with paragraph breaks allowed. Options: paragraph | preformatted | heading1 | heading2 | heading3 | heading4 | heading5 | heading6 | strong | em | hyperlink | image | embed | list-item | o-list-item | rtl.
 * @property {boolean} [config.allowTargetBlank] - Allows links to open in a new tab.
 * @property {string[]} [config.labels] - An array of strings to define labels for custom formatting.
 * @property {ImageConstraint} [config.imageConstraint] - Constraints for images within the rich text field.
 */
type StructuredTextField = {
	type: "StructuredText";
	config: {
		label: string;
		placeholder?: string;
		single?: string;
		multi?: string;
		allowTargetBlank?: boolean;
		labels?: string[];
		imageConstraint?: ImageConstraint;
	};
};

/**
 * Represents constraints for images within a rich text field.
 * @property {number} [width] - Width constraint in pixels.
 * @property {number
 * @property {number} [height] - Height constraint in pixels.
 */
type ImageConstraint = {
	width?: number;
	height?: number;
};

/**
 * Represents an Image Field in Prismic.
 * @property {"Image"} type - Field type.
 * @property {Object} config - Configuration object.
 * @property {string} config.label - Label displayed in the editor.
 * @property {Object} [config.constraint] - Constraints for the image dimensions.
 * @property {number} [config.constraint.width] - Width constraint.
 * @property {number} [config.constraint.height] - Height constraint.
 * @property {Thumbnail[]} [config.thumbnails] - Array of thumbnail configurations.
 */
type ImageField = {
	type: "Image";
	config: {
		label: string;
		constraint?: {
			width?: number;
			height?: number;
		};
		thumbnails?: Thumbnail[];
	};
};

/**
 * Represents a Thumbnail configuration for an Image field.
 * @property {string} name - Name of the thumbnail.
 * @property {number} [width] - Width of the thumbnail in pixels.
 * @property {number} [height] - Height of the thumbnail in pixels.
 */
type Thumbnail = {
	name: string;
	width?: number;
	height?: number;
};

/**
 * Represents a Link Field in Prismic.
 * @property {"Link"} type - Field type.
 * @property {Object} config - Configuration object.
 * @property {string} config.label - Label displayed in the editor.
* @property {boolean} config.allowText - Enable the text field for the link.
 */
type LinkField = {
	type: "Link";
	config: {
		label: string;
		allowText: boolean;
	};
};

/**
 * Represents an Embed Field in Prismic.
 * @property {"Embed"} type - Field type.
 * @property {Object} config - Configuration object.
 * @property {string} config.label - Label displayed in the editor.
 */
type EmbedField = {
	type: "Embed";
	config: {
		label: string;
	};
};

/**
 * Represents a GeoPoint Field in Prismic.
 * @property {"GeoPoint"} type - Field type.
 * @property {Object} config - Configuration object.
 * @property {string} config.label - Label displayed in the editor.
 */
type GeoPointField = {
	type: "GeoPoint";
	config: {
		label: string;
	};
};

/**
 * Represents a Group Field (Repeatable Fields) in Prismic.
 * It CAN NEVER BE PUT INSIDE ANOTHER FIELD.
 * @property {"Group"} type - Field type.
 * @property {Object} config - Configuration object.
 * @property {string} config.label - Label displayed in the editor.
 * @property {Record<string, PrismicField>} config.fields - Defines the fields inside the group.
 */
type GroupField = {
	type: "Group";
	config: {
		label: string;
		fields: Record<string, PrismicField>;
	};
};
`;

		/**
		 * Default slice model for the SharedSlice.
		 */
		const DEFAULT_SLICE_MODEL: SharedSlice = {
			id: "<ID_TO_CHANGE>",
			type: "SharedSlice",
			name: "<NAME_TO_CHANGE>",
			description: "<DESCRIPTION_TO_CHANGE>",
			variations: [
				{
					id: "<VARIATION_ID_TO_CHANGE>",
					name: "<NAME_TO_CHANGE>",
					docURL: "...",
					version: "initial",
					description: "<DESCRIPTION_TO_CHANGE>",
					imageUrl: "",
				},
			],
		};

		/**
		 * Calls the AI to generate the slice model.
		 */
		async function generateSliceModel(
			imageFile: Uint8Array,
			codeFile: string,
		): Promise<SharedSlice> {
			const systemPrompt = `
				You are an expert in Prismic content modeling. Using the image and the code provided, generate a valid Prismic JSON model for the slice described below. Follow these rules precisely:
				- Use the TypeScript schema provided as your reference.
				- Place all main content fields under the "primary" object.
				- Do not create any collections or groups for single-image content (background images should be a single image field).
				- Ensure that each field has appropriate placeholders, labels, and configurations.
				- Never generate a Link / Button text field, only the Link / Button field itself is enough. Just enable "allowText" when doing that.
				- Do not forget any field visible from the image provide in the user prompt.
				- Ensure to differentiate Prismic fields from just an image with visual inside the image. When that's the case, just add a Prismic image field.
				- Use the code to know exactly what is a real field and not an image. If in the code it's an image, then the field should also be an image, do a 1-1 mapping thanks to the code.
				- Do not include any decorative fields. When an element is purely visual, decorative, don't include it att all in the slice model.
				- Do not include any extra commentary or formatting.
				- When you see a repetition of an image, a text, a link, etc, NEVER create one field per repeated item, you HAVE to use a group for that.
				- When you see multiple fields repeated, you MUST use a group for that.
				- NEVER put a group inside another group field, this is not allowed. In the final JSON a group CANNOT be within another group field. YOU CANNOT NEST GROUP FIELDS! Not for any reason you are allowed to do that! Even for navigation, in header or footer you cannot nest group fields.
				- The "items" field must not be used under any circumstances. All repeatable fields should be defined using a Group field inside the primary object. If a field represents a collection of items, it must be part of a Group field, and items must never appear in the JSON output.
				- Don't forget to replace the temporary text in the "Existing Slice to update", like <ID_TO_CHANGE>, <NAME_TO_CHANGE>, <DESCRIPTION_TO_CHANGE>, <VARIATION_ID_TO_CHANGE>, etc.
				- Field placeholder should be super short, do not put the content from the image inside the placeholder.
				- Field label and id should define the field's purpose, not its content.
				- Slice name and id should define the slice's purpose, not its content.
				- Slice description should be a brief explanation of the slice's purpose not its content.
			
				!IMPORTANT!: 
					- Only return a valid JSON object representing the full slice model, nothing else before. JSON.parse on your response should not throw an error.
					- Don't return the JSON in json\`\` just directly the JSON for JSON.parse

				Reference Schema:
				${SHARED_SLICE_SCHEMA}
				
				Existing Slice to update:
				${JSON.stringify(DEFAULT_SLICE_MODEL)}
			`.trim();

			const generatedModel = await callAI<SharedSlice>({
				ai: "OPENAI",
				stepName: "MODEL",
				systemPrompt,
				imageFile,
				textContent: codeFile,
			});

			return generatedModel;
		}

		/**
		 * Calls the AI endpoint to generate mocks.
		 */
		async function generateSliceMocks(
			imageFile: Uint8Array,
			existingMocks: SharedSliceContent[],
		): Promise<SharedSliceContent[]> {
			// Build a prompt focused solely on updating the mocks.
			const systemPrompt = `
				You are a seasoned frontend engineer with deep expertise in Prismic slices.
				Your task is to update the provided mocks template based solely on the visible content in the image.
				Follow these guidelines strictly:
					- Do not modify the overall structure of the mocks template.
					- Strictly only update text content.
					- Do not touch images.
					- If you see a repetition with a group, you must create the same number of group items that are visible on the image.
					- Absolutely do not touch what is not necessary to be changed, like link "key" property, or the StructureText "direction", spans", etc or the structure, this is really important that you just do a replace of the text.
					- For structure text content you must alway keep the same structure and properties, even if empty, ONLY replace text content.
					- Only and strictly update the text content of the fields, nothing else. You should only and strictly update the text that is visible in the image.
					- Never touch the image fields, nothing should be changed for image fields.

				!IMPORTANT!:
					- Only return a valid JSON object for mocks, nothing else before. JSON.parse on your response should not throw an error.
					- Don't return the JSON in json\`\` just directly the JSON for JSON.parse

				Existing Mocks Template:
				${JSON.stringify(existingMocks)}
			`.trim();

			const updatedMock = await callAI<SharedSliceContent>({
				ai: "OPENAI",
				stepName: "MOCKS",
				systemPrompt,
				imageFile,
			});

			return [updatedMock];
		}

		/**
		 * Calls the AI endpoint to generate the slice React component.
		 */
		async function generateSliceComponentCode(
			imageFile: Uint8Array,
			codeFile: string,
			updatedSlice: SharedSlice,
		): Promise<string> {
			const systemPrompt = `
				You are a seasoned frontend engineer with deep expertise in Prismic slices.
				Your task is to generate a fully isolated React component code for a slice based on the provided image and code input.
				The goal is to create the React (HTML) structure of the slice, NO STYLING! Concentrate 100% on the perfect structure of each component.

				Follow these guidelines strictly:
					- Be self-contained.
					- For links, you must use PrismicNextLink and you must just pass the field, PrismicNextLink will handle the display of the link text, don't do it manually.
					- PrismicNextLink should never be open, just passing the field is enough like in the code example below. You can use className or inline style directly on the PrismicNextLink component.
					- Ensure to strictly respect what is defined on the model for each fields ID, do not invent or use something not in the model.
					- Ensure to use all fields provided in the model.
					- Follow the structure provided in the code example below.
					- Use the provided code to help yourself to create the structure.
					- As you can see in the example of the code you MUST never access the data with "<field>.value".
					- You need to really inspire yourself from the code example bellow in order to understand how to access field, write field etc. Do not try to invent something that you didn't see.
					- You cannot add a style prop to "PrismicRichText" component, it's not allowed.
					- It's important to respect the same imports as done in the code example bellow, import exactly from the same package.
					- Never do wrong W3C HTML structure, always respect a correct HTML structure, for example you cannot put a PrismicRichText component inside a <h1>, or a <p>, etc.
					- Ensure to map the field type to the correct Prismic component, for example, a StructuredText field should be mapped to PrismicRichText, an image field should be mapped to PrismicNextImage, a Text field should just be map to a classic <p> component
				
				!IMPORTANT!:
					- Return a valid JSON object containing only one key: "componentCode". No additional keys, text, or formatting are allowed before, after, or within the JSON object.
					- Return a valid JSON, meaning you should NEVER start with a sentence, directly the JSON so that I can JSON.parse your response.
					- All strings must be enclosed in double quotes ("). Do not use single quotes or template literals.
					- Within the string value for "componentCode", every embedded double quote must be escaped as \". Similarly, every backslash must be escaped as \\.
					- Ensure that the string value does not contain any raw control characters (such as literal newline, tab, or carriage return characters). Instead, use their escape sequences.
					- Before finalizing the output, validate that JSON.parse(output) works without throwing an error. No unescaped characters should cause the parser to crash.
					- The output must not include any markdown formatting, code block fences, or extra text. It should be a single, clean JSON object.

				## Example of a Fully Isolated Slice Component:
				-----------------------------------------------------------
				import { FC } from "react";
				import { Content } from "@prismicio/client";
				import { SliceComponentProps, PrismicRichText } from "@prismicio/react";
				import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";

				export type PascalNameToReplaceProps =
					SliceComponentProps<Content.PascalNameToReplaceSlice>;

				const PascalNameToReplace: FC<PascalNameToReplaceProps> = ({ slice }) => {
					return (
						<section
							data-slice-type={slice.slice_type}
							data-slice-variation={slice.variation}
							className="es-bounded es-alternate-grid"
						>
							<PrismicNextLink
								className="es-alternate-grid__button"
								field={slice.primary.buttonLink}
							/>
							<div className="es-alternate-grid__content">
								<PrismicNextImage
									field={slice.primary.image}
									className="es-alternate-grid__image"
								/>
								<div className="es-alternate-grid__primary-content">
									<div className="es-alternate-grid__primary-content__intro">
										<p className="es-alternate-grid__primary-content__intro__eyebrow">
											{slice.primary.eyebrowHeadline}
										</p>
										<div className="es-alternate-grid__primary-content__intro__headline">
											<PrismicRichText field={slice.primary.title} />
										</div>
										<div className="es-alternate-grid__primary-content__intro__description">
											<PrismicRichText field={slice.primary.description} />
										</div>
									</div>

									<div className="es-alternate-grid__primary-content__stats">
										{slice.primary.stats.map((stat, i) => (
											<div key={\`stat-$\{i + 1\}\`} className="es-alternate-grid__stat">
												<div className="es-alternate-grid__stat__heading">
													<PrismicRichText field={stat.title} />
												</div>
												<div className="es-alternate-grid__stat__description">
													<PrismicRichText field={stat.description} />
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						</section>
					);
				};

				export default PascalNameToReplace;
				-----------------------------------------------------------

				Model of the slice:
				${JSON.stringify(updatedSlice)}
			`.trim();

			const parsed = await callAI<{ componentCode: string }>({
				ai: "AWS",
				stepName: "CODE",
				systemPrompt,
				imageFile,
				textContent: codeFile,
			});

			if (!parsed.componentCode) {
				throw new Error("Missing key 'componentCode' in AI response.");
			}

			return parsed.componentCode;
		}

		async function generateSliceComponentCodeAppearance(
			imageFile: Uint8Array,
			codeFile: string,
			globalStyle: string,
			componentCode: string,
		): Promise<string> {
			const systemPrompt = `
				You are a seasoned frontend engineer with deep expertise in Prismic slices.
				Your task is to apply the branding (appearance) based on the provided image and code input.
				The branding is SUPER important, and the slice you create should PERFECTLY match the branding (appearance) of the provided slice image and code.

				Follow these guidelines strictly:
					- Don't change anything related to the structure of the code, ONLY apply styling, PURELY styling is your ONLY task.
					- Be self-contained, no dependency should be use to do the styling, do inline style.
					- Your goal is to make the code visually looks as close as possible to the image from the user input.
					- Ensure that the color used for the background is the same as the image provide in the user prompt! It's better no background color than a wrong one.
					- Strictly respect the padding and margin visible in the image provide in the user prompt.
					- Strictly respect the fonts size, color, type visible in the image provide in the user prompt.
					- Strictly respect the colors visible in the image provide in the user prompt.
					- Strictly respect the position of elements visible in the image provide in the user prompt.
					- Strictly respect the size of each elements visible in the image provide in the user prompt.
					- Strictly respect the overall proportions of the slice from the image provide in the user prompt.
					- Ensure image are always displayed with the same aspect ratio as the image provide in the user prompt, put constraints on the image with / height to make sure it's the same.
					- Handle animations, but never make them too long, it should be fast enough to be nice to read.
					- Use inline <style> (do not use <style jsx>).
					- Items repetitions should be styled in the same way as the image provided, the direction of the flex should be the same so that the items are vertical or horizontal as in the image.

				!IMPORTANT!:
					- DO NOT CHANGE anything else than the style BUT return everything as before for the rest, like from the import to the last export line, everything should stay the same BUT you add the styling on top.
					- Return a valid JSON object containing only one key: "componentCode". No additional keys, text, or formatting are allowed before, after, or within the JSON object.
					- Return a valid JSON, meaning you should NEVER start with a sentence, directly the JSON so that I can JSON.parse your response.
					- All strings must be enclosed in double quotes ("). Do not use single quotes or template literals.
					- Within the string value for "componentCode", every embedded double quote must be escaped as \". Similarly, every backslash must be escaped as \\.
					- Ensure that the string value does not contain any raw control characters (such as literal newline, tab, or carriage return characters). Instead, use their escape sequences.
					- Before finalizing the output, validate that JSON.parse(output) works without throwing an error. No unescaped characters should cause the parser to crash.
					- The output must not include any markdown formatting, code block fences, or extra text. It should be a single, clean JSON object.

				Existing code to apply branding on it:
				${componentCode}
			`.trim();

			// INFO: globalStyle is way too big as of today to be included in the prompt.
			// As the user is providing a slice image and code you miss the global style to help you build the best slice that match the branding, so here is the global style:
			// ${globalStyle}

			const parsed = await callAI<{ componentCode: string }>({
				ai: "AWS",
				stepName: "APPEARANCE",
				systemPrompt,
				imageFile,
				textContent: codeFile,
			});

			if (!parsed.componentCode) {
				throw new Error("Missing key 'componentCode' in AI response.");
			}

			return parsed.componentCode;
		}

		try {
			let slices: {
				sliceImage: Uint8Array;
				codeFile: string;
			}[] = [];

			const folderPath = KNOWNED_WEBSITE_URLS[args.websiteUrl];

			console.log("STEP 1: Get the slices images from the folder.");
			const sliceImages = await readImagesFromFolder(`${folderPath}/images`);

			console.log("STEP 2: Get the slices codes from the folder.");
			const sliceCodes = await readCodeFromFolder(`${folderPath}/code`);

			slices = sliceImages.map((sliceImage, index) => ({
				sliceImage,
				codeFile: sliceCodes[index],
			}));

			// Loop in parallel over each slice image and html code and generate the slice model, mocks and code.
			const updatedSlices = await Promise.all(
				slices.map(async ({ sliceImage, codeFile }, index) => {
					// ----- Q1 scope -----

					console.log(
						"STEP 3: Generate the slice model using the image for slice:",
						index,
					);
					const updatedSlice = await generateSliceModel(sliceImage, codeFile);

					console.log(
						"STEP 4: Persist the updated slice model for:",
						`${index} - ${updatedSlice.name}`,
					);
					await this.updateSlice({
						libraryID: DEFAULT_LIBRARY_ID,
						model: updatedSlice,
					});

					console.log(
						"STEP 5: Update the slice screenshot for:",
						`${index} - ${updatedSlice.name}`,
					);
					await this.updateSliceScreenshot({
						libraryID: DEFAULT_LIBRARY_ID,
						sliceID: updatedSlice.id,
						variationID: updatedSlice.variations[0].id,
						data: Buffer.from(sliceImage),
					});

					// ----- END Q1 scope -----

					let updatedMock: SharedSliceContent[];
					try {
						console.log(
							"STEP 6: Generate updated mocks for:",
							`${index} - ${updatedSlice.name}`,
						);
						const existingMocks = mockSlice({ model: updatedSlice });
						updatedMock = await generateSliceMocks(sliceImage, existingMocks);
					} catch (error) {
						console.error(
							`Failed to generate mocks for ${index} - ${updatedSlice.name}:`,
							error,
						);
						updatedMock = mockSlice({ model: updatedSlice });
					}

					let componentCode: string | undefined;
					try {
						console.log(
							"STEP 7: Generate the isolated slice component code for:",
							`${index} - ${updatedSlice.name}`,
						);
						const globalStyle = await getGlobalStyle(
							`${folderPath}/globalStyle.css`,
						);
						const initialCode = await generateSliceComponentCode(
							sliceImage,
							codeFile,
							updatedSlice,
						);

						console.log(
							"STEP 8: Generate the branding on the code:",
							`${index} - ${updatedSlice.name}`,
						);
						componentCode = await generateSliceComponentCodeAppearance(
							sliceImage,
							codeFile,
							globalStyle,
							initialCode,
						);
					} catch (error) {
						console.error(
							`Failed to generate code for ${index} - ${updatedSlice.name}:`,
							error,
						);
					}

					return { updatedSlice, componentCode, updatedMock };
				}),
			);

			// Ensure to wait to have all slices code and mocks before writing on the disk
			await Promise.all(
				updatedSlices.map(
					async ({ updatedSlice, componentCode, updatedMock }, index) => {
						console.log(
							"STEP 9: Update the slice code for:",
							`${index} - ${updatedSlice.name}`,
						);
						if (componentCode) {
							await this.createSlice({
								libraryID: DEFAULT_LIBRARY_ID,
								model: updatedSlice,
								componentContents: componentCode,
							});
						} else {
							await this.createSlice({
								libraryID: DEFAULT_LIBRARY_ID,
								model: updatedSlice,
							});
						}

						console.log(
							"STEP 10: Persist the generated mocks for:",
							`${index} - ${updatedSlice.name}`,
						);
						await this.updateSliceMocks({
							libraryID: DEFAULT_LIBRARY_ID,
							sliceID: updatedSlice.id,
							mocks: updatedMock,
						});
					},
				),
			);

			console.log("STEP 11: THE END");

			return {
				slices: updatedSlices.map(({ updatedSlice }) => updatedSlice),
			};
		} catch (error) {
			console.error("Failed to generate slice:", error);
			throw new Error("Failed to generate slice: " + error);
		}
	}
}
