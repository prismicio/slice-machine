import {
	SharedSlice,
	CustomType,
} from "@prismicio/types-internal/lib/customtypes";
import * as prismicCustomTypesClient from "@prismicio/custom-types-client";
import { Plugin, PluginSystemRunner } from "@prismicio/plugin-kit";

import { PackageManager, PrismicConfig } from "../types";
import {
	PrismicAuthManager,
	PrismicUserProfile,
} from "../auth/PrismicAuthManager";
import { createPrismicAuthManager } from "../auth/createPrismicAuthManager";
import { UnauthenticatedError } from "../errors";

import { API_ENDPOINTS, APIEndpoints } from "../constants/API_ENDPOINTS";

import { UserManager } from "./user/UserManager";
import { PrismicRepositoryManager } from "./prismicRepository/PrismicRepositoryManager";

import { PluginsManager } from "./plugins/PluginsManager";

import { ProjectManager } from "./project/ProjectManager";
import { CustomTypesManager } from "./customTypes/CustomTypesManager";
import { SlicesManager } from "./slices/SlicesManager";

import { VersionsManager } from "./versions/VersionsManager";

import { TelemetryManager } from "./telemetry/TelemetryManager";
import { buildPrismicRepositoryAPIEndpoint } from "../lib/buildPrismicRepositoryAPIEndpoint";

type PrismicManagerGetStateReturnType = {
	env: {
		shortId?: string;
		intercomHash?: string;
		manifest: {
			apiEndpoint: string;
		};
		repo: string;
		packageManager: PackageManager;
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

type PrismicManagerConstructorArgs = {
	cwd?: string;
	nativePlugins?: Record<string, Plugin>;
};

export class PrismicManager {
	private _pluginSystemRunner: PluginSystemRunner | undefined = undefined;
	private _prismicAuthManager: PrismicAuthManager;

	cwd: string;

	customTypes: CustomTypesManager;
	plugins: PluginsManager;
	prismicRepository: PrismicRepositoryManager;
	project: ProjectManager;
	slices: SlicesManager;
	telemetry: TelemetryManager;
	user: UserManager;
	versions: VersionsManager;

	constructor(args?: PrismicManagerConstructorArgs) {
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

		this.versions = new VersionsManager(this);

		this.telemetry = new TelemetryManager(this);

		this.cwd = args?.cwd ?? process.cwd();
	}

	// The `_pluginSystemRunner` property is hidden behind a function to
	// discourage access. Using a function deliberatly breaks the pattern
	// of other child managers that are accessible as properties, like
	// `project`, `plugins`, etc. We do not treat PluginSystemRunner
	// as a child manager.
	getPluginSystemRunner(): PluginSystemRunner | undefined {
		return this._pluginSystemRunner;
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
	async getState(): Promise<PrismicManagerGetStateReturnType> {
		const [
			{ prismicConfig, libraries },
			{ profile, remoteCustomTypes, remoteSlices, authError },
			customTypes,
			packageManager,
		] = await Promise.all([
			this.project.getPrismicConfig().then(async (prismicConfig) => {
				const libraries = await this._getLibraries(prismicConfig);

				return { prismicConfig, libraries };
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
						if (error instanceof prismicCustomTypesClient.ForbiddenError) {
							authError = {
								name: "ForbiddenError",
								message: "__stub__",
								reason: "__stub__",
								status: 403,
							};
						} else if (
							error instanceof prismicCustomTypesClient.UnauthorizedError
						) {
							authError = {
								name: "UnauthorizedError",
								message: "__stub__",
								reason: "__stub__",
								status: 401,
							};
						} else if (error instanceof UnauthenticatedError) {
							authError = {
								name: new UnauthenticatedError().name,
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
		const clientError: PrismicManagerGetStateReturnType["clientError"] =
			authError ||
			(profile
				? undefined
				: {
						name: new UnauthenticatedError().name,
						message: "__stub__",
						reason: "__stub__",
						status: 401, // Needed to trigger the unauthorized flow.
				  });

		return {
			env: {
				manifest: {
					apiEndpoint:
						prismicConfig.apiEndpoint ||
						buildPrismicRepositoryAPIEndpoint(prismicConfig.repositoryName),
				},
				packageManager,
				repo: prismicConfig.repositoryName,
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
		prismicConfig: PrismicConfig,
	): Promise<PrismicManagerGetStateReturnType["libraries"]> {
		const libraries: PrismicManagerGetStateReturnType["libraries"] = [];

		if (prismicConfig.libraries) {
			await Promise.all(
				prismicConfig.libraries.map(async (libraryID) => {
					const { sliceIDs } = await this.slices.readSliceLibrary({
						libraryID,
					});

					if (sliceIDs) {
						const components: PrismicManagerGetStateReturnType["libraries"][number]["components"] =
							[];

						await Promise.all(
							sliceIDs.map(async (sliceID) => {
								const { model } = await this.slices.readSlice({
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
				prismicConfig.libraries?.indexOf(library1.name) || 0;
			const libraryIndex2 =
				prismicConfig.libraries?.indexOf(library2.name) || 0;

			return Math.sign(libraryIndex1 - libraryIndex2);
		});
	}

	private async _getCustomTypes(): Promise<
		PrismicManagerGetStateReturnType["customTypes"]
	> {
		const customTypes: PrismicManagerGetStateReturnType["customTypes"] = [];

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
