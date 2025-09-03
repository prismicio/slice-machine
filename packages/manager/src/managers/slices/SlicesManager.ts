import * as t from "io-ts";
import * as fs from "fs";
import { z } from "zod";
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
import { query } from "@anthropic-ai/claude-code";

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
import { Anima } from "@animaapp/anima-sdk";
import path from "path";
import { writeFile } from "fs/promises";

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

type SlicesManagerUpsertHostedSliceScreenshotsArgs = {
	libraryID: string;
	model: SharedSlice;
	/**
	 * A map of variation IDs to remote screenshot URLs. These URLs are used to
	 * detect if a screenshot has changed when comparing with local ones and to
	 * push slices with the current screenshot. If a matching screenshot is not
	 * found in this map, the current local screenshot is uploaded again.
	 */
	variationImageUrlMap: Record<string, string>;
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

type InferFigmaSliceResponse = z.infer<typeof InferFigmaSliceResponse>;

const InferFigmaSliceResponse = z.string();

type FigmaFileInfo = {
	fileKey: string;
	nodesId: string;
};

const FIGMA_TOKEN = "***";
const ANIMA_TOKEN = "***";

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
					model,
					libraryID: args.libraryID,
					// We are pushing it for the first time here, no remote image URLs to
					// use during the update.
					variationImageUrlMap: {},
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
		args: SlicesManagerUpsertHostedSliceScreenshotsArgs,
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

				const remoteImageUrl = args.variationImageUrlMap?.[variation.id];
				const hasScreenshotChanged = !remoteImageUrl?.includes(
					createContentDigest(screenshot.data),
				);

				// If screenshot hasn't changed, no need to upload it again, just use
				// the existing variation with the remote image URL if it exists.
				if (!hasScreenshotChanged) {
					return {
						...variation,
						// Keep the existing remote screenshot URL if it exists.
						imageUrl: remoteImageUrl ?? variation.imageUrl,
					};
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

	_parseFigmaFrameUrl(figmaFrameUrl: string): FigmaFileInfo {
		const url = new URL(figmaFrameUrl);
		const fileKey = url.pathname.split("/")[2];
		const nodesId = url.searchParams
			.get("node-id")
			?.split("-")
			.join(":") as string;

		return {
			fileKey,
			nodesId,
		};
	}

	async _getFilesFromAnima(figmaFileInfo: FigmaFileInfo) {
		const anima = new Anima({
			auth: {
				token: ANIMA_TOKEN,
			},
		});

		const { files } = await anima.generateCode({
			fileKey: figmaFileInfo.fileKey,
			figmaToken: FIGMA_TOKEN,
			nodesId: [figmaFileInfo.nodesId],
			settings: {
				language: "typescript",
				framework: "react",
				styling: "inline_styles",
				enableCompactStructure: true,
			},
		});

		return files;
	}

	_saveAnimaProject(
		files: Record<string, { content: string; isBinary: boolean }>,
		folderName: string = "anima-output-tmp",
	) {
		const outputDir = path.join(process.cwd(), folderName);

		// Delete folder if already exists (even with content)
		if (fs.existsSync(outputDir)) {
			fs.rmSync(outputDir, { recursive: true });
		}
		fs.mkdirSync(outputDir, { recursive: true });

		// Save each file in the output directory
		for (const [filePath, { content, isBinary }] of Object.entries(files)) {
			const fullPathOutputDir = path.join(outputDir, filePath);

			// create directory for the file (parent directory)
			fs.mkdirSync(path.dirname(fullPathOutputDir), { recursive: true });

			if (isBinary) {
				fs.writeFileSync(fullPathOutputDir, Buffer.from(content, "base64"));
			} else {
				fs.writeFileSync(fullPathOutputDir, content, "utf8");
			}
		}
	}

	async _saveFigmaFramePng(
		figmaFileInfo: FigmaFileInfo,
		folderName: string = "anima-output-tmp",
	) {
		await writeFile(
			path.join(folderName, "screenshot-default.png"),
			Buffer.from(
				await (
					await fetch(
						(
							(await (
								await fetch(
									`https://api.figma.com/v1/images/${figmaFileInfo.fileKey}?ids=${figmaFileInfo.nodesId}&format=png`,
									{
										headers: {
											"X-Figma-Token": FIGMA_TOKEN,
										},
									},
								)
							).json()) as { images: Record<string, string> }
						).images[figmaFileInfo.nodesId],
					)
				).arrayBuffer(),
			),
		);
	}

	async _createSliceFromAnimaProject(pageType: string) {
		for await (const message of query({
			prompt: `
					You are a senior React developer specializing in component migration and refactoring.
					
					## OBJECTIVE
					Migrate a single section component from Anima platform export to Slice Machine format by moving the file from 'src/screens' to the existing 'slices' folder with proper structure.
					
					## TASK REQUIREMENTS
					
					### 1. File Discovery
					- Locate the target section file in 'src/screens' directory (or similar path)
					- Identify the main component file and any associated assets, styles, or utilities
					- Note the current file structure and dependencies
					
					### 2. Migration Process  
					- Create a new folder in 'slices' folder named after the section component
					- Move the section file into the new slice folder
					- Rename the file to match slice naming conventions if needed
					- Update all import/export statements to reflect the new location
					- Ensure the slice style respect how the other slices are styled (e.g.: CSS modules, etc.)

					### 3. Move and rename the screenshot-default.png file to the new slice folder
					- Move the screenshot-default.png file to the new slice folder
					- Rename the file to match slice naming conventions

					### 4. Add the slice to the custom type ${pageType}
					- Add the slice to the custom type ${pageType}
					- In the property 'slices' of the custom type, add the slice with the correct id in "config.choices"
					- Respect the format by looking at other custom types
					- It's in the "Slice Zone" that the slice need to be added

					### 5. Update slice/index.ts file
					- Add the slice to the slices/index.ts file with the other exported slices
					- Even if it's written do not edit, you need to update the index.ts file to export the new slice
					- Follow the same structure as the other slices
					
					### 6. Validation Checklist
					- Verify the moved component renders without errors
					- Confirm all imports resolve correctly
					- Check that no Anima platform artifacts remain
					- Ensure the component is properly exported from its new location
					- Validate that the screenshot-default.png file is at the correct location with the correct name
					
					## Code Quality Standards
					- Preserve existing coding style and patterns from the project
					- Maintain all functionality - this is a structural move, not a rewrite  
					- Remove any Anima-specific dependencies or references
					- Ensure no external dependencies are introduced unnecessarily
					- Update relative import paths to work from the new location

					## IMPORTANT NOTES
					- You have to use MCP tools for the steps when needed
					- Do not remove the anima project files, keep everything related to anima folders
					- DO NOT FORGET to add the slice to the custom type
					- DO NOT FORGET to update the slices/index.ts file
					- DO NOT try to run slice machine 
					- DO NOT try to build the project
					
					## LAST VALIDATION
					- BE SURE TO CHECK OTHERS SLICES AND EVERYTHING YOU TOUCH THAT SHOULD LOOK LIKE THE EXISTING CODE OF THE PROJECT
					
					## SUCCESS CRITERIA
					The single section component should be successfully relocated to 'slices/{SectionName}/' and function identically to its original implementation, with all Anima dependencies removed.
				`,
			options: {
				cwd: path.join(process.cwd()),
				abortController: new AbortController(),
				mcpServers: {
					prismic: {
						command: "npx",
						args: ["-y", "@prismicio/mcp-server@latest"],
					},
				},
				allowedTools: [
					"Bash",
					"Read",
					"Write",
					"FileSearch",
					"Grep",
					"Glob",
					"MultiEdit",
					"mcp__prismic__how_to_code_slice",
				],
				permissionMode: "bypassPermissions",
			},
		})) {
			console.log("Claude message", JSON.stringify(message, null, 2));
		}
	}

	_removeAnimaProject() {
		const outputDir = path.join(process.cwd(), "anima-output-tmp");
		fs.rmSync(outputDir, { recursive: true, force: true });
	}

	async inferFigmaSlice({
		figmaFrameUrl,
		pageType,
	}: {
		figmaFrameUrl: string;
		pageType: string;
	}): Promise<InferFigmaSliceResponse> {
		console.log("START", {
			figmaFrameUrl,
			pageType,
			currentDir: process.cwd(),
		});

		// Extract Figma file ID and nodes ID from the URL
		const figmaFileInfo = this._parseFigmaFrameUrl(figmaFrameUrl);

		console.log("2");

		if (
			figmaFileInfo === undefined ||
			figmaFileInfo.fileKey === undefined ||
			figmaFileInfo.nodesId === undefined ||
			figmaFileInfo.fileKey === "" ||
			figmaFileInfo.nodesId === ""
		) {
			throw new Error("Invalid Figma URL");
		}

		console.log("3");

		// Get project files from Figma URL
		const files = await this._getFilesFromAnima(figmaFileInfo);

		console.log("4");

		// Save project files
		this._saveAnimaProject(files);

		console.log("5");

		// Save Figma frame png to the project
		await this._saveFigmaFramePng(figmaFileInfo);

		console.log("6");

		// Move the section generated from Anima to the slices folder
		await this._createSliceFromAnimaProject(pageType);

		console.log("7");

		// Remove the Anima project files
		this._removeAnimaProject();

		console.log("END", { figmaFileInfo, pageType, currentDir: process.cwd() });

		return InferFigmaSliceResponse.parse("TODO");
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
}
