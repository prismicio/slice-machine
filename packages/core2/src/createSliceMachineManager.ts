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
import * as prismicCustomTypesCilent from "@prismicio/custom-types-client";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { createRequire } from "node:module";
import { CustomTypes } from "@prismicio/types-internal";
import fetch from "node-fetch";

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

type SliceMachineManagerReadSliceMocksArgs = {
	libraryID: string;
	sliceID: string;
};

type SliceMachineManagerReadSliceMocksReturnType = {
	mocks?: SharedSlice[];
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

type SliceMachineManagerReadCustomTypeMocksConfigArgs = {
	customTypeID: string;
};

type SliceMachineManagerReadCustomTypeMocksConfigArgsReturnType = {
	// TODO
	mocksConfig?: Record<string, unknown>;
	errors: HookError[];
};

type SliceMachineManagerUpdateCustomTypeMocksConfigArgs = {
	customTypeID: string;
	// TODO
	mocksConfig?: Record<string, unknown>;
};

type SliceMachineManagerUpdateCustomTypeMocksConfigArgsReturnType = {
	errors: HookError[];
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
			model: CustomTypes.Widgets.Slices.SharedSlice;
			screenshots: Record<
				string,
				{
					path: string;
					hash: string;
				}
			>;
			mock?: SharedSlice[];
			mockConfig: Record<string, unknown>;
		}[];
		meta: {
			name?: string;
			version?: string;
			isNodeModule: boolean;
			isDownloaded: boolean;
			isManual: boolean;
		};
	}[];
	customTypes: CustomTypes.CustomType[];
	remoteCustomTypes: CustomTypes.CustomType[];
	remoteSlices: CustomTypes.Widgets.Slices.SharedSlice[];
	clientError?: { message: string; status: number };
};

type SliceMachineManagerGetReleaseNotesForVersionArgs = {
	version: string;
};

export class SliceMachineManager {
	private _sliceMachinePluginRunner: SliceMachinePluginRunner | undefined;
	private _sliceMachineConfig: SliceMachineConfig | undefined;
	private _sliceMachineRoot: string | undefined;

	prismicAuthManager = createPrismicAuthManager();

	login = this.prismicAuthManager.login.bind(this.prismicAuthManager);
	logout = this.prismicAuthManager.logout.bind(this.prismicAuthManager);
	checkIsLoggedIn = this.prismicAuthManager.checkIsLoggedIn.bind(
		this.prismicAuthManager,
	);
	getProfile = this.prismicAuthManager.getProfile.bind(this.prismicAuthManager);

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
				// Rather than making a request or each
				// version, we can make one request for all (at
				// least to some paginated amount).
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
					const { model } = await this.readSlice({
						libraryID,
						sliceID,
					});
					const { mocks } = await this.readSliceMocks({
						libraryID,
						sliceID,
					});
					const { mocksConfig } = await this.readSliceMocksConfig({
						libraryID,
						sliceID,
					});

					if (model) {
						components.push({
							from: libraryID,
							href: libraryID.replace(/\//g, "--"),
							pathToSlice: "pathToSlice",
							fileName: "fileName",
							extension: "extension",
							model,
							screenshots: {},
							mock: mocks,
							mockConfig: mocksConfig || {},
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

		const customTypes: SliceMachineManagerGetStateReturnType["customTypes"] =
			[];
		const { ids: customTypeIDs } = await this.readCustomTypeLibrary();
		if (customTypeIDs) {
			for (const customTypeID of customTypeIDs) {
				const { model } = await this.readCustomType({ id: customTypeID });

				if (model) {
					customTypes.push(model);
				}
			}
		}

		const remoteCustomTypes: SliceMachineManagerGetStateReturnType["remoteCustomTypes"] =
			isLoggedIn ? await this.fetchRemoteCustomTypes() : [];

		const remoteSlices: SliceMachineManagerGetStateReturnType["remoteSlices"] =
			isLoggedIn ? await this.fetchRemoteSlices() : [];

		// SM UI detects if a user is logged out by looking at
		// `clientError`. Here, we simulate what the old core does by
		// returning an `ErrorWithStatus`-like object if the user is
		// not logged in.
		const clientError: SliceMachineManagerGetStateReturnType["clientError"] =
			isLoggedIn
				? undefined
				: { message: "Could not fetch slices", status: 401 };

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
				// TODO: Don't hardcode this!
				packageManager: "npm",
				// TODO: Don't hardcode this!
				repo: sliceMachineConfig.repositoryName,
				// TODO: Don't hardcode this!
				sliceMachineAPIUrl: "http://localhost:9999",
				intercomHash: profile?.intercomHash,
				shortId: profile?.shortId,
			},
			libraries,
			customTypes,
			remoteCustomTypes,
			remoteSlices,
			clientError,
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

	/**
	 * @returns Record of uploaded screenshot URLs.
	 */
	async pushSlice(
		args: SliceMachineManagerPushSliceArgs,
	): Promise<Record<string, string | undefined>> {
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		// TODO: Handle errors
		const { model } = await this.readSlice({
			libraryID: args.libraryID,
			sliceID: args.sliceID,
		});

		if (model) {
			const authenticationToken =
				await this.prismicAuthManager.getAuthenticationToken();

			const sliceMachineConfig = await this.getSliceMachineConfig();

			// TODO: Create a single shared client.
			const client = prismicCustomTypesCilent.createClient({
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
				if (error instanceof prismicCustomTypesCilent.NotFoundError) {
					// If the Slice doesn't exist on the repository, insert it.
					await client.insertSharedSlice(model);
				}
			}
		}

		// TODO: Handle uploading screenshots to S3 and return URLs for each.

		return {};
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

	async readSliceMocks(
		args: SliceMachineManagerReadSliceMocksArgs,
	): Promise<SliceMachineManagerReadSliceMocksReturnType> {
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		const hookResult = await this._sliceMachinePluginRunner.callHook(
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
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		const hookResult = await this._sliceMachinePluginRunner.callHook(
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
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		const hookResult = await this._sliceMachinePluginRunner.callHook(
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
		args: SliceMachineManagerPushCustomTypeArgs,
	): Promise<void> {
		// TODO: Handle errors
		const { model } = await this.readCustomType({ id: args.id });

		if (model) {
			const authenticationToken =
				await this.prismicAuthManager.getAuthenticationToken();

			const sliceMachineConfig = await this.getSliceMachineConfig();

			// TODO: Create a single shared client.
			const client = prismicCustomTypesCilent.createClient({
				repositoryName: sliceMachineConfig.repositoryName,
				token: authenticationToken,
				fetch,
			});

			try {
				// Check if Custom Type already exists on the repository.
				await client.getCustomTypeByID(args.id);

				// If it exists on the repository, update it.
				await client.updateCustomType(model);
			} catch (error) {
				if (error instanceof prismicCustomTypesCilent.NotFoundError) {
					// If it doesn't exist on the repository, insert it.
					await client.insertCustomType(model);
				}
			}
		}
	}

	async readCustomTypeMocksConfig(
		args: SliceMachineManagerReadCustomTypeMocksConfigArgs,
	): Promise<SliceMachineManagerReadCustomTypeMocksConfigArgsReturnType> {
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		const hookResult = await this._sliceMachinePluginRunner.callHook(
			"custom-type:asset:read",
			{
				customTypeID: args.customTypeID,
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

	async updateCustomTypeMocksConfig(
		args: SliceMachineManagerUpdateCustomTypeMocksConfigArgs,
	): Promise<SliceMachineManagerUpdateCustomTypeMocksConfigArgsReturnType> {
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		const hookResult = await this._sliceMachinePluginRunner.callHook(
			"custom-type:asset:update",
			{
				customTypeID: args.customTypeID,
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

	async fetchRemoteCustomTypes(): Promise<CustomTypeModel[]> {
		const authenticationToken =
			await this.prismicAuthManager.getAuthenticationToken();

		const sliceMachineConfig = await this.getSliceMachineConfig();

		// TODO: Create a single shared client.
		const client = prismicCustomTypesCilent.createClient({
			repositoryName: sliceMachineConfig.repositoryName,
			token: authenticationToken,
			fetch,
		});

		return await client.getAllCustomTypes();
	}

	async fetchRemoteSlices(): Promise<SharedSliceModel[]> {
		const authenticationToken =
			await this.prismicAuthManager.getAuthenticationToken();

		const sliceMachineConfig = await this.getSliceMachineConfig();

		// TODO: Create a single shared client.
		const client = prismicCustomTypesCilent.createClient({
			repositoryName: sliceMachineConfig.repositoryName,
			token: authenticationToken,
			fetch,
		});

		return await client.getAllSharedSlices();
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
