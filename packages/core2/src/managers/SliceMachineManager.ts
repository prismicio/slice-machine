import { CustomTypes } from "@prismicio/types-internal";
import { SliceMachinePluginRunner } from "@slicemachine/plugin-kit";

import { createContentDigest } from "../lib/createContentDigest";

import {
	PackageChangelog,
	PackageManager,
	PackageVersion,
	SliceMachineConfig,
} from "../types";
import {
	PrismicAuthManager,
	PrismicUserProfile,
} from "../auth/PrismicAuthManager";
import { createPrismicAuthManager } from "../auth/createPrismicAuthManager";

import { PluginsManager } from "./_PluginsManager";

import { AnalyticsManager } from "./_AnalyticsManager";
import { UserManager } from "./_UserManager";
import { RepositoryManager } from "./_RepositoryManager";
import { VersionsManager } from "./_VersionsManager";

import { ProjectManager } from "./_ProjectManager";
import { CustomTypesManager } from "./_CustomTypesManager";
import { SlicesManager } from "./_SlicesManager";
import { SnippetsManager } from "./_SnippetsManager";
import { ScreenshotsManager } from "./_ScreenshotsManager";
import { SimulatorManager } from "./_SimulatorManager";

type SliceMachineManagerGetStateReturnType = {
	env: {
		shortId?: string;
		intercomHash?: string;
		manifest: {
			localSliceSimulatorURL?: string;
		};
		repo: string;
		changelog: PackageChangelog;
		packageManager: PackageManager;
		mockConfig: unknown;
		framework: unknown; // TODO: Remove
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
					data: Buffer;
				}
			>;
			mock?: CustomTypes.Widgets.Slices.SharedSlice[];
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

export class SliceMachineManager {
	private _sliceMachinePluginRunner: SliceMachinePluginRunner | undefined =
		undefined;
	private _prismicAuthManager: PrismicAuthManager;

	plugins: PluginsManager;

	analytics: AnalyticsManager;
	user: UserManager;
	repository: RepositoryManager;
	versions: VersionsManager;

	project: ProjectManager;
	customTypes: CustomTypesManager;
	slices: SlicesManager;
	snippets: SnippetsManager;
	screenshots: ScreenshotsManager;
	simulator: SimulatorManager;

	constructor() {
		// _prismicAuthManager must be set at least before UserManager
		// is instantiated. It depends on the PrismicAuthManager for
		// authentication-related methods.
		this._prismicAuthManager = createPrismicAuthManager();

		this.plugins = new PluginsManager(this);

		this.analytics = new AnalyticsManager(this);
		this.user = new UserManager(this);
		this.repository = new RepositoryManager(this);
		this.versions = new VersionsManager(this);

		this.project = new ProjectManager(this);
		this.customTypes = new CustomTypesManager(this);
		this.slices = new SlicesManager(this);
		this.snippets = new SnippetsManager(this);
		this.screenshots = new ScreenshotsManager(this);
		this.simulator = new SimulatorManager(this);

		// Supress a TypeScript warning about an unused property. This
		// code will be eliminated in production builds via dead-code
		// elimination.
		if (process.env.NODE_ENV === "development") {
			this._sliceMachinePluginRunner;
		}
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

	// TODO: Remove this global-state method. It is expensive and a
	// potential source of bugs due to data inconsistency. SM UI relies on
	// it heavily, so removal will require significant effort.
	async getState(): Promise<SliceMachineManagerGetStateReturnType> {
		const [
			{ sliceMachineConfig, libraries },
			{ profile, remoteCustomTypes, remoteSlices },
			customTypes,
			currentVersion,
			allStableVersions,
		] = await Promise.all([
			this.project.getSliceMachineConfig().then(async (sliceMachineConfig) => {
				const libraries = await this._getLibraries(sliceMachineConfig);

				return { sliceMachineConfig, libraries };
			}),
			this._getProfile().then(async (profile) => {
				if (profile) {
					const [remoteCustomTypes, remoteSlices] = await Promise.all([
						this.customTypes.fetchRemoteCustomTypes(),
						this.slices.fetchRemoteSlices(),
					]);

					return {
						profile,
						remoteCustomTypes,
						remoteSlices,
					};
				} else {
					return {
						profile,
						remoteCustomTypes: [],
						remoteSlices: [],
					};
				}
			}),
			this._getCustomTypes(),
			this.project.getRunningSliceMachineVersion(),
			this.versions.getAllStableSliceMachineVersions(),
		]);

		const latestNonBreakingVersion = ""; // TODO
		const updateAvailable = false; // TODO
		const versions = await Promise.all(
			allStableVersions.map(async (version): Promise<PackageVersion> => {
				const releaseNotes = await this.versions.getReleaseNotesForVersion({
					version,
				});

				return {
					versionNumber: version,
					releaseNote: releaseNotes ?? null,
					// TODO
					kind: "MINOR",
				};
			}),
		);

		// TODO: SM UI detects if a user is logged out by looking at
		// `clientError`. Here, we simulate what the old core does by
		// returning an `ErrorWithStatus`-like object if the user is
		// not logged in.
		const clientError: SliceMachineManagerGetStateReturnType["clientError"] =
			profile ? undefined : { message: "Could not fetch slices", status: 401 };

		return {
			env: {
				changelog: {
					currentVersion,
					latestNonBreakingVersion,
					updateAvailable,
					versions,
				},
				framework: "",
				manifest: {
					localSliceSimulatorURL: sliceMachineConfig.localSliceSimulatorURL,
				},
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
								const [{ model }, { mocks }, { mocksConfig }] =
									await Promise.all([
										this.slices.readSlice({ libraryID, sliceID }),
										this.slices.readSliceMocks({ libraryID, sliceID }),
										this.slices.readSliceMocksConfig({ libraryID, sliceID }),
									]);

								if (model) {
									const screenshots: typeof components[number]["screenshots"] =
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
													path: "__stub__",
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
										mock: mocks,
										mockConfig: mocksConfig || {},
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

		return libraries;
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
