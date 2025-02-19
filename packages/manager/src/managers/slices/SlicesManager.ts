import * as t from "io-ts";
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
import { chromium } from "playwright";
import sharp from "sharp";

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
} from "@aws-sdk/client-bedrock-runtime";

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
				modelId: "anthropic.claude-3-5-sonnet-20240620-v1:0",
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
				modelId: "anthropic.claude-3-5-sonnet-20240620-v1:0",
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
				modelId: "anthropic.claude-3-5-sonnet-20240620-v1:0",
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

		const INPUT_TOKEN_PRICE = 0.000003;
		const OUTPUT_TOKEN_PRICE = 0.000015;

		let totalTokens = {
			slicesDetection: {
				input: 0,
				output: 0,
				total: 0,
				price: 0,
			},
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

		function updateTotalTokens(
			functionKey:
				| "slicesDetection"
				| "modelGeneration"
				| "mocksGeneration"
				| "codeGeneration",
			response: {
				usage?: {
					inputTokens?: number;
					outputTokens?: number;
					totalTokens?: number;
				};
			},
		) {
			if (
				!response.usage ||
				!response.usage.inputTokens ||
				!response.usage.outputTokens ||
				!response.usage.totalTokens
			) {
				throw new Error(`No usage data was returned for ${functionKey}.`);
			}
			totalTokens[functionKey] = {
				input: totalTokens[functionKey].input + response.usage.inputTokens,
				output: totalTokens[functionKey].output + response.usage.outputTokens,
				total: totalTokens[functionKey].total + response.usage.totalTokens,
				price:
					totalTokens[functionKey].price +
					response.usage.inputTokens * INPUT_TOKEN_PRICE +
					response.usage.outputTokens * OUTPUT_TOKEN_PRICE,
			};
		}

		// Validate AWS credentials
		const AWS_REGION = "us-east-1";
		const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env;
		if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
			throw new Error("AWS credentials are not set.");
		}

		const sliceMachineConfig = await this.project.getSliceMachineConfig();
		const libraryIDs = sliceMachineConfig.libraries || [];
		const DEFAULT_LIBRARY_ID = libraryIDs[0];

		/**
		 * Take a screenshot of a full page.
		 */
		async function takePageScreenshot(url: string): Promise<Uint8Array> {
			const browser = await chromium.launch();
			const page = await browser.newPage();
			await page.goto(url);
			const pageScreenshotBuffer = await page.screenshot({
				path: "fullpage.png",
				fullPage: true,
			});
			await browser.close();
			const resizedImage = await sharp(pageScreenshotBuffer)
				.resize({
					width: 8000,
					height: 8000,
					fit: "inside", // Maintains aspect ratio; scales down only if needed.
				})
				.toBuffer();

			const pageScreenshot = new Uint8Array(resizedImage);

			return pageScreenshot;
		}

		/**
		 * Call the AI to get the coordinates of each slice found in the image.
		 */
		async function getSlicesCoordinates(
			client: BedrockRuntimeClient,
			pageScreenshot: Uint8Array,
		): Promise<
			{
				left: number;
				top: number;
				width: number;
				height: number;
			}[]
		> {
			const metadata = await sharp(pageScreenshot).metadata();
			const systemPrompt = `
				You are an expert in Prismic slices. Using the image provided, return the coordinates of each slice found in the image.
				You need to ensure each slice is an isolate reusable part of the website page you are seeing in the image.
				The definition of a Prismic slice is: Prismic slices are sections of your website. Prismic documents contain a dynamic “slice zone” that allows content creators to add, edit, and rearrange slices to compose dynamic layouts for any page design, such as blog posts, landing pages, and tutorials.
				It's better to have more smaller size well splitted than big slices with too many things.
				
				Requirements:
				- Provide the coordinates for each slice in the following format: { "left": number, "top": number, "width": number, "height": number }.
				- The coordinates must always be completely within the image boundaries, leaving a margin (at least 5 pixels) from each edge to ensure that Sharp’s extract tool does not throw an "extract_area: bad extract area" error.
				- The slices must not overlap and must be valid for use directly with Sharp's extract method.
				- The output must be a valid JSON with one key "slices" that maps to an array of slice coordinate objects. No additional text, explanations, or metadata should be included. JSON.parse on your response should not throw an error.
				- The entire output must fit in a single response.
				- I will use the user image from the input as parameter to sharp function, so ensure the coordinates match the image I give you.
				- Every time I'm using your result and pass it to sharp function, it's giving me an error "Error: extract_area: bad extract area", ENSURE it cannot happen.

				The coordinates MUST fit in this range:
				 - width: ${metadata.width}
				 - height: ${metadata.height}

				Here is the code that will be used to extract from the image each slices using your coordinates:
				"""
				const slices = await Promise.all(
					slicesCoordinates.map(async (slice) => {
						const sliceScreenshotBuffer = await sharp(pageScreenshot)
							.extract({
								left: slice.left,
								top: slice.top,
								width: slice.width,
								height: slice.height,
							})
							.toBuffer();
						const sliceScreenshot = new Uint8Array(sliceScreenshotBuffer);

						return sliceScreenshot;
					}),
				);
				"""

				!IMPORTANT!: 
					- Only return a valid JSON with one key "slices" and an array of slices coordinates, nothing else before. JSON.parse on your response should not throw an error.
					- All your response should fit in a single return response.
					- Never stop the response until you totally finish the full JSON response you wanted.
			`.trim();

			const command = new ConverseCommand({
				modelId: "anthropic.claude-3-5-sonnet-20240620-v1:0",
				system: [{ text: systemPrompt }],
				messages: [
					{
						role: "user",
						content: [
							{
								image: { format: "png", source: { bytes: pageScreenshot } },
							},
						],
					},
				],
			});

			const response = await client.send(command);
			console.log("Slices coordinates response:", JSON.stringify(response));

			updateTotalTokens("slicesDetection", response);

			const resultText = response.output?.message?.content?.[0]?.text?.trim();
			if (!resultText) {
				throw new Error("No valid slices coordinates was generated.");
			}

			try {
				const slicesCoordinates = JSON.parse(resultText);

				return slicesCoordinates.slices;
			} catch (error) {
				throw new Error("Failed to parse AI response for model: " + error);
			}
		}

		/**
		 * Extract slices from the coordinates found in the image.
		 */
		async function extractSlicesFromCoordinates(
			pageScreenshot: Uint8Array,
			slicesCoordinates: {
				left: number;
				top: number;
				width: number;
				height: number;
			}[],
		): Promise<Uint8Array[]> {
			const slices = await Promise.all(
				slicesCoordinates.map(async (slice) => {
					const sliceScreenshotBuffer = await sharp(pageScreenshot)
						.extract({
							left: slice.left,
							top: slice.top,
							width: slice.width,
							height: slice.height,
						})
						.toBuffer();
					const sliceScreenshot = new Uint8Array(sliceScreenshotBuffer);

					return sliceScreenshot;
				}),
			);

			return slices;
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
			client: BedrockRuntimeClient,
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
					- Never stop the response until you totally finish the full JSON response you wanted.

				Reference Schema:
				${SHARED_SLICE_SCHEMA}
				
				Existing Slice to update:
				${JSON.stringify(DEFAULT_SLICE_MODEL)}
			`.trim();
			const command = new ConverseCommand({
				modelId: "anthropic.claude-3-5-sonnet-20240620-v1:0",
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

			updateTotalTokens("modelGeneration", response);

			const resultText = response.output?.message?.content?.[0]?.text?.trim();
			if (!resultText) {
				throw new Error("No valid slice model was generated.");
			}

			try {
				const generatedModel = JSON.parse(resultText);

				return generatedModel;
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
					- Never stop the response until you totally finish the full JSON response you wanted.
				
				Existing Mocks Template:
				${JSON.stringify(existingMocks, null, 2)}
			`.trim();

			const command = new ConverseCommand({
				modelId: "anthropic.claude-3-5-sonnet-20240620-v1:0",
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

			updateTotalTokens("mocksGeneration", response);

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
					- Never stop the response until you totally finish the full JSON response you wanted.
				
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
				modelId: "anthropic.claude-3-5-sonnet-20240620-v1:0",
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

			updateTotalTokens("codeGeneration", response);

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
			// STEP 1: From a website url take as screenshot of the whole page.
			console.log("STEP 1: Take a screenshot of the whole page.");
			const pageScreenshot = await takePageScreenshot(args.websiteUrl);

			// STEP 2: Ask AI to separate the whole image into individual slices.
			console.log("STEP 2: Generate the slice model using the image.");
			const slicesCoordinates = await getSlicesCoordinates(
				bedrockClient,
				pageScreenshot,
			);

			// STEP 3: Extract each slice from the coordinates.
			console.log("STEP 3: Extract each slice from the coordinates");
			const slices = await extractSlicesFromCoordinates(
				pageScreenshot,
				slicesCoordinates,
			);

			// Loop in parallel over each slice image and generate the slice model, mocks and code.
			const updatedSlices = await Promise.all(
				slices.map(async (sliceImage, index) => {
					// ----- Q1 scope -----

					// STEP 4: Generate the slice model using the image.
					console.log(
						"STEP 4: Generate the slice model using the image for slice:",
						index,
					);
					const updatedSlice = await generateSliceModel(
						bedrockClient,
						sliceImage,
					);

					// STEP 5: Persist the updated slice model.
					console.log(
						"STEP 5: Persist the updated slice model for:",
						`${index} - ${updatedSlice.name}`,
					);
					await this.updateSlice({
						libraryID: DEFAULT_LIBRARY_ID,
						model: updatedSlice,
					});

					// STEP 6: Update the slice screenshot.
					console.log(
						"STEP 6: Update the slice screenshot for:",
						`${index} - ${updatedSlice.name}`,
					);
					await this.updateSliceScreenshot({
						libraryID: DEFAULT_LIBRARY_ID,
						sliceID: updatedSlice.id,
						variationID: updatedSlice.variations[0].id,
						data: Buffer.from(sliceImage),
					});

					// ----- END Q1 scope -----

					try {
						// STEP 7: Generate updated mocks.
						console.log(
							"STEP 7: Generate updated mocks for:",
							`${index} - ${updatedSlice.name}`,
						);
						const existingMocks = mockSlice({ model: updatedSlice });
						const updatedMocks = await generateSliceMocks(
							bedrockClient,
							sliceImage,
							existingMocks,
						);

						// STEP 8: Generate the isolated slice component code.
						console.log(
							"STEP 8: Generate the isolated slice component code for:",
							`${index} - ${updatedSlice.name}`,
						);
						const componentCode = await generateSliceComponentCode(
							bedrockClient,
							sliceImage,
							existingMocks,
						);

						// STEP 9: Update the slice code.
						console.log(
							"STEP 9: Update the slice code for:",
							`${index} - ${updatedSlice.name}`,
						);
						await this.createSlice({
							libraryID: DEFAULT_LIBRARY_ID,
							model: updatedSlice,
							componentContents: componentCode,
						});

						// STEP 10: Persist the generated mocks.
						console.log(
							"STEP 10: Persist the generated mocks for:",
							`${index} - ${updatedSlice.name}`,
						);
						await this.updateSliceMocks({
							libraryID: DEFAULT_LIBRARY_ID,
							sliceID: updatedSlice.id,
							mocks: updatedMocks,
						});
					} catch (error) {
						console.error(
							`Failed to generate mocks and / or code for ${index} - ${updatedSlice.name}:`,
							error,
						);
						await this.createSlice({
							libraryID: DEFAULT_LIBRARY_ID,
							model: updatedSlice,
						});
					}

					return updatedSlice;
				}),
			);

			// Usage
			console.log("STEP 11: THE END");
			console.log("Tokens used:", totalTokens);
			const totalPrice = Object.values(totalTokens).reduce(
				(acc, { price }) => acc + price,
				0,
			);
			console.log("Total price:", totalPrice);

			return { slices: updatedSlices };
		} catch (error) {
			console.error("Failed to generate slice:", error);
			throw new Error("Failed to generate slice: " + error);
		}
	}
}
