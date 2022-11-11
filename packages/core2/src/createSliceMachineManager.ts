import * as t from "io-ts";
import {
	CustomTypeModel,
	SharedSlice,
	SharedSliceModel,
} from "@prismicio/types";
import {
	CallHookReturnType,
	CustomTypeCreateHook,
	CustomTypeCreateHookData,
	CustomTypeDeleteHook,
	CustomTypeDeleteHookData,
	CustomTypeReadHookData,
	CustomTypeUpdateHook,
	CustomTypeUpdateHookData,
	HookError,
	SliceAssetUpdateHook,
	SliceCreateHook,
	SliceCreateHookData,
	SliceDeleteHook,
	SliceDeleteHookData,
	SliceLibraryReadHookData,
	SliceMachinePluginRunner,
	SliceReadHookData,
	SliceUpdateHook,
	SliceUpdateHookData,
	createSliceMachinePluginRunner,
} from "@slicemachine/plugin-kit";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { createRequire } from "node:module";
import { CustomTypes } from "@prismicio/types-internal";

import { DecodeError } from "./lib/DecodeError";
import { bufferCodec } from "./lib/bufferCodec";
import { captureSliceSimulatorScreenshot } from "./lib/captureSliceSimulatorScreenshot";
import { decode } from "./lib/decode";
import { decodeSliceMachineConfig } from "./lib/decodeSliceMachineConfig";
import { fetchGitHubReleaseBodyForRelease } from "./lib/fetchGitHubReleaseBodyForRelease";
import { fetchNPMPackageVersions } from "./lib/fetchNPMPackageVersions";
import { loadModuleWithJiti } from "./lib/loadModuleWithJiti";
import { locateFileUpward } from "./lib/findFileUpward";

import {
	PackageChangelog,
	PackageManager,
	PackageVersion,
	SliceMachineConfig,
} from "./types";
import {
	SLICE_MACHINE_CONFIG_FILENAMES,
	SLICE_MACHINE_NPM_PACKAGE_NAME,
} from "./constants";
import {
	createPrismicAuthManager,
	PrismicAuthManager,
	PrismicUserProfile,
} from "./createPrismicAuthManager";

function assertPluginsInitialized(
	pluginRunner: SliceMachinePluginRunner | undefined,
): asserts pluginRunner is NonNullable<typeof pluginRunner> {
	if (pluginRunner == undefined) {
		throw new Error(
			"Plugins have not yet been initialized. Run `SliceMachineManager.prototype.initPlugins()` before re-calling this method.",
		);
	}
}

// const withDecodeError = <
// 	// eslint-disable-next-line @typescript-eslint/no-explicit-any
// 	TDecodeError extends DecodeError<any>,
// 	TError extends Error,
// >(
// 	decodeError?: TDecodeError,
// 	errors?: TError[],
// ): (TDecodeError | TError)[] => {
// 	return [decodeError, ...(errors || [])].filter(
// 		(error): error is NonNullable<typeof error> => Boolean(error),
// 	);
// };

// type MaybeArray<T> = T | T[];

// const concatArr = <TElement1, TElement2, TElement3, TElement4, TElement5>(
// 	element1?: MaybeArray<TElement1>,
// 	element2?: MaybeArray<TElement2>,
// 	element3?: MaybeArray<TElement3>,
// 	element4?: MaybeArray<TElement4>,
// 	element5?: MaybeArray<TElement5>,
// ): (TElement1 | TElement2 | TElement3 | TElement4 | TElement5)[] => {
// 	const elements = [element1, element2, element3, element4, element5];
//
// 	const res: (TElement1 | TElement2 | TElement3 | TElement4 | TElement5)[] = [];
//
// 	for (const element of elements) {
// 		if (Array.isArray(element)) {
// 			for (const subelement of element) {
// 				res.push(subelement);
// 			}
// 		} else if (element) {
// 			res.push(element);
// 		}
// 	}
//
// 	return res;
// };

const decodeHookResult = <
	A,
	O,
	I,
	THookResult extends Awaited<CallHookReturnType>,
>(
	codec: t.Type<A, O, I>,
	hookResult: THookResult,
) => {
	const data: A[] = [];
	const errors: DecodeError<I>[] = [];

	for (const dataElement of hookResult.data) {
		const { value, error } = decode(codec, dataElement);

		if (error) {
			errors.push(error);
		} else {
			data.push(value);
		}
	}

	return {
		data,
		errors: [...errors, ...hookResult.errors],
	};
};

// function concatErrors<TError1, TError2, TError3, TError4, TError5>(
// 	error1?: MaybeArray<TError1>,
// 	error2?: MaybeArray<TError2>,
// 	error3?: MaybeArray<TError3>,
// 	error4?: MaybeArray<TError4>,
// 	error5?: MaybeArray<TError5>,
// ): (TError1 | TError2 | TError3 | TError4 | TError5)[] {
// 	return [error1, error2, error3, error4, error5]
// 		.flat()
// 		.filter((error): error is NonNullable<typeof error> => Boolean(error));
// }

// const concatErrors = <TError extends Error>(
// 	...errors: (undefined | TError | TError[])[]
// ): TError[] => {
// 	const res: TError[] = [];
//
// 	for (const error of errors.flat()) {
// 		if (error) {
// 			res.push(error);
// 		}
// 	}
//
// 	return res;
// };

type OnlyHookErrors<
	THookResult extends
		| { errors: HookError[] }
		| Promise<{ errors: HookError[] }>,
> = Pick<Awaited<THookResult>, "errors">;

// // TODO: Understand why `Pick` must be used directly in the return type rather
// // than using `OnlyHookErrors`.
// const onlyHookErrors = <THookResult extends { errors: HookError[] }>(
// 	hookResult: THookResult,
// ): Pick<Awaited<THookResult>, "errors"> => {
// 	return { errors: hookResult.errors };
// };

// type UseFirstHookDataElement<THookFn extends HookFn> = Omit<
// 	Awaited<CallHookReturnType<THookFn>>,
// 	"data"
// > & {
// 	data: Awaited<CallHookReturnType<THookFn>>["data"] | undefined;
// };
//
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// const useFirstHookDataElement = <THookValue extends { data: any[] }>(
// 	hookResult: THookValue,
// ): Omit<THookValue, "data"> & { data: THookValue["data"][number] } => {
// 	return {
// 		...hookResult,
// 		data: hookResult.data[0],
// 	};
// };

export const createSliceMachineManager = (): SliceMachineManager => {
	return new SliceMachineManager();
};

type SliceMachineManagerPushSliceArgs = {
	libraryID: string;
	sliceID: string;
};

type SliceMachineManagerReadSliceLibraryReturnType = {
	sliceIDs: string[] | undefined;
	errors: (DecodeError | HookError)[];
};

type SliceMachineManagerReadAllSlicesForLibraryArgs = {
	libraryID: string;
};

type SliceMachineManagerReadAllSlicesForLibraryReturnType = {
	models: { model: SharedSliceModel }[];
	errors: (DecodeError | HookError)[];
};

type SliceMachineManagerReadAllSlicesReturnType = {
	models: {
		libraryID: string;
		model: SharedSliceModel;
	}[];
	errors: (DecodeError | HookError)[];
};

type SliceMachineManagerReadSliceReturnType = {
	model: SharedSliceModel | undefined;
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
};

type SliceMachineManagerCaptureSliceScreenshotReturnType = {
	data: Buffer;
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

type SliceMachineManagerReadCustomTypeLibraryReturnType = {
	ids: string[] | undefined;
	errors: (DecodeError | HookError)[];
};

type SliceMachineManagerReadAllCustomTypeReturnType = {
	models: { model: CustomTypeModel }[];
	errors: (DecodeError | HookError)[];
};

type SliceMachineManagerReadCustomTypeReturnType = {
	model: CustomTypeModel | undefined;
	errors: (DecodeError | HookError)[];
};

type SliceMachineManagerPushCustomTypeArgs = {
	id: string;
};

type SliceMachineManagerGetStateReturnType = {
	env: {
		shortId?: string;
		intercomHash?: string;
		manifest: any;
		repo: string;
		changelog: PackageChangelog;
		packageManager: PackageManager;
		mockConfig: any;
		framework: any;
		sliceMachineAPIUrl: string;
	};
	libraries: {
		name: string;
		path: string;
		isLocal: boolean;
		components: {
			from: string;
			href: string;
			pathToSlice: string;
			fileName: string | null;
			extension: string | null;
			model: Omit<CustomTypes.Widgets.Slices.SharedSlice, "variations"> & {
				variations: (Omit<
					CustomTypes.Widgets.Slices.SharedSlice["variations"][number],
					"primary" | "items"
				> & {
					primary: {
						key: string;
						value: NonNullable<
							CustomTypes.Widgets.Slices.SharedSlice["variations"][number]["primary"]
						>[string];
					}[];
					items: {
						key: string;
						value: NonNullable<
							CustomTypes.Widgets.Slices.SharedSlice["variations"][number]["items"]
						>[string];
					}[];
				})[];
			};
			screenshots: Record<
				string,
				{
					path: string;
					hash: string;
				}
			>;
			mock?: SharedSlice;
		}[];
		meta: {
			name?: string;
			version?: string;
			isNodeModule: boolean;
			isDownloaded: boolean;
			isManual: boolean;
		};
	}[];
	customTypes: [];
	remoteCustomTypes: [];
	remoteSlices: [];
	clientError?: any;
};

type SliceMachineManagerGetReleaseNotesForVersionArgs = {
	version: string;
};

export class SliceMachineManager {
	private _sliceMachinePluginRunner: SliceMachinePluginRunner | undefined;
	private _sliceMachineConfig: SliceMachineConfig | undefined;
	private _sliceMachineRoot: string | undefined;
	private _prismicAuthStateManager: PrismicAuthManager =
		createPrismicAuthManager();

	// TODO: Replace with a middleware creator. We need to inject the logic
	// into a shared HTTP server, not spawn a new server.
	createPrismicAuthServer =
		this._prismicAuthStateManager.createPrismicAuthServer.bind(
			this._prismicAuthStateManager,
		);
	login = this._prismicAuthStateManager.login.bind(
		this._prismicAuthStateManager,
	);
	logout = this._prismicAuthStateManager.logout.bind(
		this._prismicAuthStateManager,
	);
	checkIsLoggedIn = this._prismicAuthStateManager.checkIsLoggedIn.bind(
		this._prismicAuthStateManager,
	);
	getProfile = this._prismicAuthStateManager.getProfile.bind(
		this._prismicAuthStateManager,
	);

	async getProjectRoot(): Promise<string> {
		if (this._sliceMachineRoot) {
			return this._sliceMachineRoot;
		}

		const sliceMachineConfigFilePath = await locateFileUpward(
			SLICE_MACHINE_CONFIG_FILENAMES,
		);

		this._sliceMachineRoot = path.dirname(sliceMachineConfigFilePath);

		return this._sliceMachineRoot;
	}

	async getSliceMachineConfig(): Promise<SliceMachineConfig> {
		if (this._sliceMachineConfig) {
			return this._sliceMachineConfig;
		} else {
			return await this.loadSliceMachineConfig();
		}
	}

	async loadSliceMachineConfig(): Promise<SliceMachineConfig> {
		const projectRoot = await this.getProjectRoot();

		let configModule: unknown | undefined;

		for (const configFileName of SLICE_MACHINE_CONFIG_FILENAMES) {
			const configFilePath = path.resolve(projectRoot, configFileName);

			try {
				await fs.access(configFilePath);
				configModule = loadModuleWithJiti(path.resolve(configFileName));
			} catch {
				// noop
			}
		}

		if (!configModule) {
			// TODO: Write a more friendly and useful message.
			throw new Error("No config found.");
		}

		const { value: sliceMachineConfig, error } =
			decodeSliceMachineConfig(configModule);

		if (error) {
			// TODO: Write a more friendly and useful message.
			throw new Error(`Invalid config. ${error.errors.join(", ")}`);
		}

		// Allow cached config reading using `SliceMachineManager.prototype.getProjectConfig()`.
		this._sliceMachineConfig = sliceMachineConfig;

		return sliceMachineConfig;
	}

	async initPlugins(): Promise<void> {
		const projectRoot = await this.getProjectRoot();
		const sliceMachineConfig = await this.getSliceMachineConfig();

		this._sliceMachinePluginRunner = createSliceMachinePluginRunner({
			project: {
				root: projectRoot,
				config: sliceMachineConfig,
			},
		});

		await this._sliceMachinePluginRunner.init();
	}

	// TODO: Remove this global-state method. It is expensive and a
	// potential source of bugs due to data inconsistency. SM UI relies on
	// it heavily, so removal will require significant effort.
	async getState(): Promise<SliceMachineManagerGetStateReturnType> {
		const sliceMachineConfig = await this.getSliceMachineConfig();

		let profile: PrismicUserProfile | undefined;
		const isLoggedIn = await this.checkIsLoggedIn();
		if (isLoggedIn) {
			profile = await this.getProfile();
		}

		const currentVersion = await this.getRunningSliceMachineVersion();
		const allStableVersions = await this.getAllStableSliceMachineVersions();
		const latestNonBreakingVersion = ""; // TODO
		const updateAvailable = false; // TODO
		const versions = await Promise.all(
			allStableVersions.map(async (version): Promise<PackageVersion> => {
				// TODO: I was rate limited :(
				// const releaseNotes = await this.getReleaseNotesForVersion({ version });
				const releaseNotes = undefined;

				return {
					versionNumber: version,
					releaseNote: releaseNotes ?? null,
					// TODO
					kind: "MINOR",
				};
			}),
		);

		const libraries: SliceMachineManagerGetStateReturnType["libraries"] = [];
		for (const libraryID of sliceMachineConfig.libraries || []) {
			const { sliceIDs } = await this.readSliceLibrary({ libraryID });

			if (sliceIDs) {
				const components: SliceMachineManagerGetStateReturnType["libraries"][number]["components"] =
					[];

				for (const sliceID of sliceIDs) {
					const { model } = await this.readSlice({ libraryID, sliceID });

					if (model) {
						const reshapedModel = {
							...model,
							variations: model.variations.map((variation) => {
								return {
									...variation,
									primary: Object.entries(variation.primary || {}).map(
										([key, fieldModel]) => {
											return { key, value: fieldModel };
										},
									),
									items: Object.entries(variation.items || {}).map(
										([key, fieldModel]) => {
											return { key, value: fieldModel };
										},
									),
								};
							}),
						};

						components.push({
							from: libraryID,
							href: libraryID.replace(/\//g, "--"),
							pathToSlice: "pathToSlice",
							fileName: "fileName",
							extension: "extension",
							model: reshapedModel,
							screenshots: {},
						});
					}
				}

				libraries.push({
					name: libraryID,
					path: libraryID,
					isLocal: true, // TODO: Do we still support node_modules-based libraries?
					components,
					meta: {
						// TODO: Do we still support node_modules-based libraries?
						isNodeModule: false,
						isDownloaded: false,
						isManual: true,
					},
				});
			}
		}

		// TODO: Populate this object.
		return {
			env: {
				changelog: {
					currentVersion,
					latestNonBreakingVersion,
					updateAvailable,
					versions,
				},
				framework: "",
				manifest: {},
				mockConfig: {},
				packageManager: "npm",
				repo: "repo",
				// TODO: Don't hardcode this!
				sliceMachineAPIUrl: "http://localhost:9999",
				intercomHash: profile?.intercomHash,
				shortId: profile?.shortId,
			},
			libraries,
			customTypes: [],
			remoteCustomTypes: [],
			remoteSlices: [],
			clientError: undefined,
		};
	}

	async getAllStableSliceMachineVersions(): Promise<string[]> {
		const versions = await fetchNPMPackageVersions({
			packageName: SLICE_MACHINE_NPM_PACKAGE_NAME,
		});

		return versions.filter((version) => {
			// Exclude tagged versions (e.g. `1.0.0-alpha.0`).
			// Exclude versions < 0.1.0 (e.g. `0.0.1`).
			return /^\d+\.[1-9]\d*\.\d+$/.test(version);
		});
	}

	async getRunningSliceMachineVersion(): Promise<string> {
		const sliceMachineDir = await this.locateSliceMachineDir();

		const sliceMachinePackageJSONContents = await fs.readFile(
			path.join(sliceMachineDir, "package.json"),
			"utf8",
		);

		// TODO: Validate the contents? This code currently assumes a
		// well-formed document.
		const json = JSON.parse(sliceMachinePackageJSONContents);

		return json.version;
	}

	async getReleaseNotesForVersion(
		args: SliceMachineManagerGetReleaseNotesForVersionArgs,
	): Promise<string | undefined> {
		return await fetchGitHubReleaseBodyForRelease({
			tag: args.version,
		});
	}

	async readSliceLibrary(
		args: SliceLibraryReadHookData,
	): Promise<SliceMachineManagerReadSliceLibraryReturnType> {
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		// TODO: Should validation happen at the `callHook` level?
		// Including validation at the hook level would ensure
		// hook-based actions are validated.
		const hookResult = await this._sliceMachinePluginRunner.callHook(
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

	async readAllSlicesForLibrary(
		args: SliceMachineManagerReadAllSlicesForLibraryArgs,
	): Promise<SliceMachineManagerReadAllSlicesForLibraryReturnType> {
		assertPluginsInitialized(this._sliceMachinePluginRunner);

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
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		const sliceMachineConfig = await this.getSliceMachineConfig();
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
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		const hookResult = await this._sliceMachinePluginRunner.callHook(
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
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		const hookResult = await this._sliceMachinePluginRunner.callHook(
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
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		const hookResult = await this._sliceMachinePluginRunner.callHook(
			"slice:update",
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
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		const hookResult = await this._sliceMachinePluginRunner.callHook(
			"slice:delete",
			args,
		);

		return {
			errors: hookResult.errors,
		};
	}

	async pushSlice(_args: SliceMachineManagerPushSliceArgs): Promise<void> {
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		// TODO: Push Slice to Prismic.
	}

	async readSliceScreenshot(
		args: SliceMachineManagerReadSliceScreenshotArgs,
	): Promise<SliceMachineManagerReadSliceScreenshotReturnType> {
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		const hookResult = await this._sliceMachinePluginRunner.callHook(
			"slice:asset:read",
			{
				libraryID: args.libraryID,
				sliceID: args.sliceID,
				assetID: `screenshot-${args.variationID}`,
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
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		const hookResult = await this._sliceMachinePluginRunner.callHook(
			"slice:asset:update",
			{
				libraryID: args.libraryID,
				sliceID: args.sliceID,
				asset: {
					id: `screenshot-${args.variationID}`,
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
		const projectConfig = await this.getSliceMachineConfig();

		const { data } = await captureSliceSimulatorScreenshot({
			sliceID: args.sliceID,
			libraryID: args.libraryID,
			variationID: args.variationID,
			projectConfig,
		});

		return {
			data,
		};
	}

	async readCustomTypeLibrary(): Promise<SliceMachineManagerReadCustomTypeLibraryReturnType> {
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		const hookResult = await this._sliceMachinePluginRunner.callHook(
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
			ids: data[0]?.ids,
			errors,
		};
	}

	async readAllCustomTypes(): Promise<SliceMachineManagerReadAllCustomTypeReturnType> {
		assertPluginsInitialized(this._sliceMachinePluginRunner);

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

				if (model) {
					res.models.push({ model });
				}
			}
		}

		return res;
	}

	async createCustomType(
		args: CustomTypeCreateHookData,
	): Promise<OnlyHookErrors<CallHookReturnType<CustomTypeCreateHook>>> {
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		const hookResult = await this._sliceMachinePluginRunner.callHook(
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
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		const hookResult = await this._sliceMachinePluginRunner.callHook(
			"custom-type:read",
			args,
		);
		const { data, errors } = decodeHookResult(
			t.type({
				model: CustomTypes.CustomType,
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
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		const hookResult = await this._sliceMachinePluginRunner.callHook(
			"custom-type:update",
			args,
		);

		return {
			errors: hookResult.errors,
		};
	}

	// TODO: Disallow until Custom Types can be deleted.
	async deleteCustomType(
		args: CustomTypeDeleteHookData,
	): Promise<OnlyHookErrors<CallHookReturnType<CustomTypeDeleteHook>>> {
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		const hookResult = await this._sliceMachinePluginRunner.callHook(
			"custom-type:delete",
			args,
		);

		return {
			errors: hookResult.errors,
		};
	}

	async pushCustomType(
		_args: SliceMachineManagerPushCustomTypeArgs,
	): Promise<void> {
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		// TODO: Push CustomType to Prismic.
	}

	// TODO: Should this be renamed to `locateSliceMachineUIDir()` (note
	// the addition of "UI")?
	async locateSliceMachineDir(): Promise<string> {
		const projectRoot = await this.getProjectRoot();

		const require = createRequire(path.join(projectRoot, "index.js"));
		const sliceMachinePackageJSONPath = require.resolve(
			`${SLICE_MACHINE_NPM_PACKAGE_NAME}/package.json`,
		);

		return path.dirname(sliceMachinePackageJSONPath);
	}
}
