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
} from "@prismicio/plugin-kit";

import { DecodeError } from "../../lib/DecodeError";
import { assertPluginsInitialized } from "../../lib/assertPluginsInitialized";
import { bufferCodec } from "../../lib/bufferCodec";
import { decodeHookResult } from "../../lib/decodeHookResult";
import { createContentDigest } from "../../lib/createContentDigest";
import { mockSlice } from "../../lib/mockSlice";
import fetch from "../../lib/fetch";

import { OnlyHookErrors } from "../../types";
import { DEFAULT_SLICE_SCREENSHOT_URL } from "../../constants/DEFAULT_SLICE_SCREENSHOT_URL";
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
	mocks?: SharedSliceContent[];
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
	/**
	 * A record of Slice variation IDs mapped to uploaded screenshot URLs.
	 */
	screenshotURLs: Record<string, string> | undefined;
	errors: (DecodeError | HookError)[];
};

type PrismicManagerReadSliceScreenshotArgs = {
	libraryID: string;
	sliceID: string;
	variationID: string;
};

type PrismicManagerReadSliceScreenshotReturnType = {
	data: Buffer | undefined;
	errors: (DecodeError | HookError)[];
};

type PrismicManagerUpdateSliceScreenshotArgs = {
	libraryID: string;
	sliceID: string;
	variationID: string;
	data: Buffer;
};

type PrismicManagerDeleteSliceScreenshotArgs = {
	libraryID: string;
	sliceID: string;
	variationID: string;
};

type PrismicManagerReadSliceMocksArgs = {
	libraryID: string;
	sliceID: string;
};

type PrismicManagerReadSliceMocksReturnType = {
	mocks?: SharedSliceContent[];
	errors: (DecodeError | HookError)[];
};

type PrismicManagerUpdateSliceMocksArgs = {
	libraryID: string;
	sliceID: string;
	mocks: SharedSliceContent[];
};

type PrismicManagerUpdateSliceMocksArgsReturnType = {
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
	assetsErrors: (DecodeError | HookError)[];
};

type PrismicManagerDeleteSliceVariationArgs = {
	libraryID: string;
	sliceID: string;
	variationID: string;
};

type PrismicManagerDeleteSliceVariationReturnType = {
	errors: (DecodeError | HookError)[];
	assetsErrors: (DecodeError | HookError)[];
};

type PrismicManagerConvertLegacySliceToSharedSliceArgs = {
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

type PrismicManagerConvertLegacySliceToSharedSliceReturnType = {
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

		const updateSliceMocksArgs: PrismicManagerUpdateSliceMocksArgs = {
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

		const { mocks: previousMocks } = await this.readSliceMocks({
			libraryID: args.libraryID,
			sliceID: args.model.id,
		});
		const { model: previousModel } = await this.readSlice({
			libraryID: args.libraryID,
			sliceID: args.model.id,
		});
		const hookResult = await this.pluginSystemRunner.callHook(
			"slice:update",
			args,
		);

		const updatedMocks = mockSlice({
			model: args.model,
			mocks: previousMocks,
			diff: SliceComparator.compare(previousModel, args.model),
		});
		const updateSliceMocksArgs: PrismicManagerUpdateSliceMocksArgs = {
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
			let updateSliceMocksErrors: PrismicManagerUpdateSliceMocksArgsReturnType["errors"] =
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
		args: PrismicManagerConvertLegacySliceToSharedSliceArgs,
	): Promise<PrismicManagerConvertLegacySliceToSharedSliceReturnType> {
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

	async readSliceScreenshot(
		args: PrismicManagerReadSliceScreenshotArgs,
	): Promise<PrismicManagerReadSliceScreenshotReturnType> {
		assertPluginsInitialized(this.pluginSystemRunner);

		const hookResult = await this.pluginSystemRunner.callHook(
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
		args: PrismicManagerUpdateSliceScreenshotArgs,
	): Promise<OnlyHookErrors<CallHookReturnType<SliceAssetUpdateHook>>> {
		assertPluginsInitialized(this.pluginSystemRunner);

		const hookResult = await this.pluginSystemRunner.callHook(
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
		args: PrismicManagerDeleteSliceScreenshotArgs,
	): Promise<OnlyHookErrors<CallHookReturnType<SliceAssetUpdateHook>>> {
		assertPluginsInitialized(this.pluginSystemRunner);

		const hookResult = await this.pluginSystemRunner.callHook(
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
		args: PrismicManagerReadSliceMocksArgs,
	): Promise<PrismicManagerReadSliceMocksReturnType> {
		assertPluginsInitialized(this.pluginSystemRunner);

		const hookResult = await this.pluginSystemRunner.callHook(
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
		args: PrismicManagerUpdateSliceMocksArgs,
	): Promise<PrismicManagerUpdateSliceMocksArgsReturnType> {
		assertPluginsInitialized(this.pluginSystemRunner);

		const hookResult = await this.pluginSystemRunner.callHook(
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

	async updateSliceModelScreenshotsInPlace(
		args: SlicesManagerUpsertHostedSliceScreenshotsArgs,
	): Promise<SharedSlice> {
		const repositoryName = await this.project.getRepositoryName();

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
