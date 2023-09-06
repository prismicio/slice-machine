import {
	SharedSlice,
	CustomType,
} from "@prismicio/types-internal/lib/customtypes";
import { SharedSliceContent } from "@prismicio/types-internal/lib/content";
import {
	ForbiddenError,
	UnauthorizedError,
} from "@prismicio/custom-types-client";
import {
	SliceMachinePlugin,
	SliceMachinePluginRunner,
} from "@slicemachine/plugin-kit";

import { createContentDigest } from "../lib/createContentDigest";

import { PackageManager, SliceMachineConfig } from "../types";
import {
	PrismicAuthManager,
	PrismicUserProfile,
} from "../auth/PrismicAuthManager";
import { createPrismicAuthManager } from "../auth/createPrismicAuthManager";

import { API_ENDPOINTS, APIEndpoints } from "../constants/API_ENDPOINTS";

import { UserManager } from "./user/UserManager";
import { PrismicRepositoryManager } from "./prismicRepository/PrismicRepositoryManager";

import { PluginsManager } from "./plugins/PluginsManager";

import { ProjectManager } from "./project/ProjectManager";
import { CustomTypesManager } from "./customTypes/CustomTypesManager";
import { SlicesManager } from "./slices/SlicesManager";
import { SnippetsManager } from "./snippets/SnippetsManager";
import { ScreenshotsManager } from "./screenshots/ScreenshotsManager";
import { SimulatorManager } from "./simulator/SimulatorManager";

import { VersionsManager } from "./versions/VersionsManager";

import { TelemetryManager } from "./telemetry/TelemetryManager";
import { buildPrismicRepositoryAPIEndpoint } from "../lib/buildPrismicRepositoryAPIEndpoint";
import { DocumentationManager } from "./documentation/DocumentationManager";
import { SliceTemplateLibraryManager } from "./sliceTemplateLibrary/SliceTemplateLibraryManager";

type SliceMachineManagerGetStateReturnType = {
	env: {
		shortId?: string;
		intercomHash?: string;
		manifest: {
			apiEndpoint: string;
			localSliceSimulatorURL?: string;
		};
		repo: string;
		packageManager: PackageManager;
		supportsSliceSimulator: boolean;
		endpoints: APIEndpoints;
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
			model: SharedSlice;
			screenshots: Record<
				string,
				{
					hash: string;
					data: Buffer;
				}
			>;
			mocks?: SharedSliceContent[];
		}[];
		meta: {
			name?: string;
			version?: string;
			isNodeModule: boolean;
			isDownloaded: boolean;
			isManual: boolean;
		};
	}[];
	customTypes: CustomType[];
	remoteCustomTypes: CustomType[];
	remoteSlices: SharedSlice[];
	clientError?: {
		name: string;
		message: string;
		status: number;
		reason: string;
	};
};

type SliceMachineManagerConstructorArgs = {
	cwd?: string;
	nativePlugins?: Record<string, SliceMachinePlugin>;
};

export class SliceMachineManager {
	private _sliceMachinePluginRunner: SliceMachinePluginRunner | undefined =
		undefined;
	private _prismicAuthManager: PrismicAuthManager;

	cwd: string;

	customTypes: CustomTypesManager;
	plugins: PluginsManager;
	prismicRepository: PrismicRepositoryManager;
	project: ProjectManager;
	screenshots: ScreenshotsManager;
	simulator: SimulatorManager;
	slices: SlicesManager;
	snippets: SnippetsManager;
	documentation: DocumentationManager;
	sliceTemplateLibrary: SliceTemplateLibraryManager;
	telemetry: TelemetryManager;
	user: UserManager;
	versions: VersionsManager;

	constructor(args?: SliceMachineManagerConstructorArgs) {
		// _prismicAuthManager must be set at least before UserManager
		// is instantiated. It depends on the PrismicAuthManager for
		// authentication-related methods.
		this._prismicAuthManager = createPrismicAuthManager();

		this.user = new UserManager(this);
		this.prismicRepository = new PrismicRepositoryManager(this);

		this.plugins = new PluginsManager(this, {
			nativePlugins: args?.nativePlugins,
		});

		this.project = new ProjectManager(this);
		this.customTypes = new CustomTypesManager(this);
		this.slices = new SlicesManager(this);
		this.snippets = new SnippetsManager(this);
		this.screenshots = new ScreenshotsManager(this);
		this.simulator = new SimulatorManager(this);
		this.documentation = new DocumentationManager(this);
		this.sliceTemplateLibrary = new SliceTemplateLibraryManager(this);

		this.versions = new VersionsManager(this);

		this.telemetry = new TelemetryManager(this);

		this.cwd = args?.cwd ?? process.cwd();
	}

	// The `_sliceMachinePluginRunner` property is hidden behind a function to
	// discourage access. Using a function deliberatly breaks the pattern
	// of other child managers that are accessible as properties, like
	// `project`, `plugins`, etc. We do not treat SliceMachinePluginRunner
	// as a child manager.
	getSliceMachinePluginRunner(): SliceMachinePluginRunner | undefined {
		return this._sliceMachinePluginRunner;
	}

	// The `_prismicAuthManager` property is hidden behind a function to
	// discourage access. Using a function deliberatly breaks the pattern
	// of other child managers that are accessible as properties, like
	// `project`, `plugins`, etc. We do not treat PrismicAuthManager as a
	// child manager.
	getPrismicAuthManager(): PrismicAuthManager {
		return this._prismicAuthManager;
	}

	getAPIEndpoints(): APIEndpoints {
		return API_ENDPOINTS;
	}

	// TODO: Remove this global-state method. It is expensive and a
	// potential source of bugs due to data inconsistency. SM UI relies on
	// it heavily, so removal will require significant effort.
	async getState(): Promise<SliceMachineManagerGetStateReturnType> {
		const [
			{ sliceMachineConfig, libraries },
			{ profile, remoteCustomTypes, remoteSlices, authError },
			customTypes,
			packageManager,
		] = await Promise.all([
			this.project.getSliceMachineConfig().then(async (sliceMachineConfig) => {
				const libraries = await this._getLibraries(sliceMachineConfig);

				return { sliceMachineConfig, libraries };
			}),
			this._getProfile().then(async (profile) => {
				let authError;
				if (profile) {
					try {
						const [remoteCustomTypes, remoteSlices] = await Promise.all([
							this.customTypes.fetchRemoteCustomTypes(),
							this.slices.fetchRemoteSlices(),
						]);

						return {
							profile,
							remoteCustomTypes,
							remoteSlices,
							authError,
						};
					} catch (error) {
						// Non-Prismic error
						if (
							error instanceof UnauthorizedError ||
							error instanceof ForbiddenError
						) {
							authError = {
								name: "__stub__",
								message: "__stub__",
								reason: "__stub__",
								status: 401,
							};
						} else {
							throw error;
						}
					}
				}

				return {
					profile,
					remoteCustomTypes: [],
					remoteSlices: [],
					authError,
				};
			}),
			this._getCustomTypes(),
			this.project.detectPackageManager(),
		]);

		// SM UI detects if a user is logged out by looking at
		// `clientError`. Here, we simulate what the old core does by
		// returning an `ErrorWithStatus`-like object if the user does
		// not have access to the repository or is not logged in.
		const clientError: SliceMachineManagerGetStateReturnType["clientError"] =
			authError ||
			(profile
				? undefined
				: {
						name: "__stub__",
						message: "__stub__",
						reason: "__stub__",
						status: 401, // Needed to trigger the unauthorized flow.
				  });

		return {
			env: {
				manifest: {
					apiEndpoint:
						sliceMachineConfig.apiEndpoint ||
						buildPrismicRepositoryAPIEndpoint(
							sliceMachineConfig.repositoryName,
						),
					localSliceSimulatorURL: sliceMachineConfig.localSliceSimulatorURL,
				},
				packageManager,
				supportsSliceSimulator: this.simulator.supportsSliceSimulator(),
				repo: sliceMachineConfig.repositoryName,
				intercomHash: profile?.intercomHash,
				shortId: profile?.shortId,
				endpoints: this.getAPIEndpoints(),
			},
			libraries,
			customTypes,
			remoteCustomTypes,
			remoteSlices,
			clientError,
		};
	}

	private async _getProfile(): Promise<PrismicUserProfile | undefined> {
		let profile: PrismicUserProfile | undefined;

		const isLoggedIn = await this.user.checkIsLoggedIn();

		if (isLoggedIn) {
			profile = await this.user.getProfile();
			await this.user.refreshAuthenticationToken();
		}

		return profile;
	}

	private async _getLibraries(
		sliceMachineConfig: SliceMachineConfig,
	): Promise<SliceMachineManagerGetStateReturnType["libraries"]> {
		const libraries: SliceMachineManagerGetStateReturnType["libraries"] = [];

		if (sliceMachineConfig.libraries) {
			await Promise.all(
				sliceMachineConfig.libraries.map(async (libraryID) => {
					const { sliceIDs } = await this.slices.readSliceLibrary({
						libraryID,
					});

					if (sliceIDs) {
						const components: SliceMachineManagerGetStateReturnType["libraries"][number]["components"] =
							[];

						await Promise.all(
							sliceIDs.map(async (sliceID) => {
								const [{ model }, { mocks }] = await Promise.all([
									this.slices.readSlice({ libraryID, sliceID }),
									this.slices.readSliceMocks({ libraryID, sliceID }),
								]);

								if (model) {
									const screenshots: (typeof components)[number]["screenshots"] =
										{};
									await Promise.all(
										model.variations.map(async (variation) => {
											const screenshot = await this.slices.readSliceScreenshot({
												libraryID,
												sliceID,
												variationID: variation.id,
											});

											if (screenshot.data) {
												screenshots[variation.id] = {
													hash: createContentDigest(screenshot.data),
													data: screenshot.data,
												};
											}
										}),
									);

									components.push({
										from: libraryID,
										href: libraryID.replace(/\//g, "--"),
										pathToSlice: "pathToSlice",
										fileName: "fileName",
										extension: "extension",
										model,
										screenshots,
										mocks,
									});
								}
							}),
						);

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
				}),
			);
		}

		// Preserve library order from config file
		return libraries.sort((library1, library2) => {
			const libraryIndex1 =
				sliceMachineConfig.libraries?.indexOf(library1.name) || 0;
			const libraryIndex2 =
				sliceMachineConfig.libraries?.indexOf(library2.name) || 0;

			return Math.sign(libraryIndex1 - libraryIndex2);
		});
	}

	private async _getCustomTypes(): Promise<
		SliceMachineManagerGetStateReturnType["customTypes"]
	> {
		const customTypes: SliceMachineManagerGetStateReturnType["customTypes"] =
			[];

		const { ids: customTypeIDs } =
			await this.customTypes.readCustomTypeLibrary();

		if (customTypeIDs) {
			await Promise.all(
				customTypeIDs.map(async (customTypeID) => {
					const { model } = await this.customTypes.readCustomType({
						id: customTypeID,
					});

					if (model) {
						customTypes.push(model);
					}
				}),
			);
		}

		return customTypes;
	}
}
