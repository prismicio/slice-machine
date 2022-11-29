import { CustomTypes } from "@prismicio/types-internal";
import { SliceMachinePluginRunner } from "@slicemachine/plugin-kit";

import { PackageChangelog, PackageManager, PackageVersion } from "../types";
import {
	PrismicAuthManager,
	PrismicUserProfile,
} from "../auth/PrismicAuthManager";
import { createPrismicAuthManager } from "../auth/createPrismicAuthManager";

import { CustomTypesManager } from "./_CustomTypesManager";
import { PluginsManager } from "./_PluginsManager";
import { ProjectManager } from "./_ProjectManager";
import { SlicesManager } from "./_SlicesManager";
import { SnippetsManager } from "./_SnippetsManager";
import { UserManager } from "./_UserManager";
import { VersionsManger } from "./_VersionsManager";
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

	project: ProjectManager;
	plugins: PluginsManager;
	slices: SlicesManager;
	customTypes: CustomTypesManager;
	snippets: SnippetsManager;
	simulator: SimulatorManager;
	user: UserManager;
	versions: VersionsManger;

	constructor() {
		// _prismicAuthManager must be set at least before UserManager
		// is instantiated. It depends on the PrismicAuthManager for
		// authentication-related methods.
		this._prismicAuthManager = createPrismicAuthManager();

		this.project = new ProjectManager(this);
		this.plugins = new PluginsManager(this);
		this.slices = new SlicesManager(this);
		this.customTypes = new CustomTypesManager(this);
		this.snippets = new SnippetsManager(this);
		this.simulator = new SimulatorManager(this);
		this.user = new UserManager(this);
		this.versions = new VersionsManger(this);

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
		const sliceMachineConfig = await this.project.getSliceMachineConfig();

		let profile: PrismicUserProfile | undefined;
		const isLoggedIn = await this.user.checkIsLoggedIn();
		if (isLoggedIn) {
			profile = await this.user.getProfile();
			await this.user.refreshAuthenticationToken();
		}

		const currentVersion = await this.project.getRunningSliceMachineVersion();
		const allStableVersions =
			await this.versions.getAllStableSliceMachineVersions();
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
			const { sliceIDs } = await this.slices.readSliceLibrary({ libraryID });

			if (sliceIDs) {
				const components: SliceMachineManagerGetStateReturnType["libraries"][number]["components"] =
					[];

				for (const sliceID of sliceIDs) {
					const { model } = await this.slices.readSlice({
						libraryID,
						sliceID,
					});
					const { mocks } = await this.slices.readSliceMocks({
						libraryID,
						sliceID,
					});
					const { mocksConfig } = await this.slices.readSliceMocksConfig({
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
		const { ids: customTypeIDs } =
			await this.customTypes.readCustomTypeLibrary();
		if (customTypeIDs) {
			for (const customTypeID of customTypeIDs) {
				const { model } = await this.customTypes.readCustomType({
					id: customTypeID,
				});

				if (model) {
					customTypes.push(model);
				}
			}
		}

		const remoteCustomTypes: SliceMachineManagerGetStateReturnType["remoteCustomTypes"] =
			isLoggedIn ? await this.customTypes.fetchRemoteCustomTypes() : [];

		const remoteSlices: SliceMachineManagerGetStateReturnType["remoteSlices"] =
			isLoggedIn ? await this.slices.fetchRemoteSlices() : [];

		// TODO: SM UI detects if a user is logged out by looking at
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
}
