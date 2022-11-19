import { CustomTypes } from "@prismicio/types-internal";

import { PrismicUserProfile } from "../auth/PrismicAuthManager";
import { PackageChangelog, PackageManager, PackageVersion } from "../types";

import { CustomTypesManager } from "./_CustomTypesManager";
import { PluginsManager } from "./_PluginsManager";
import { ProjectManager } from "./_ProjectManager";
import { SlicesManager } from "./_SlicesManager";
import { UserManager } from "./_UserManager";
import { VersionsManger } from "./_VersionsManager";

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
	user = new UserManager(this);
	project = new ProjectManager(this);
	plugins = new PluginsManager(this);
	slices = new SlicesManager(this);
	customTypes = new CustomTypesManager(this);
	versions = new VersionsManger(this);

	// TODO: Remove this global-state method. It is expensive and a
	// potential source of bugs due to data inconsistency. SM UI relies on
	// it heavily, so removal will require significant effort.
	async getState(): Promise<SliceMachineManagerGetStateReturnType> {
		const sliceMachineConfig = await this.project.getSliceMachineConfig();

		let profile: PrismicUserProfile | undefined;
		const isLoggedIn = await this.user.checkIsLoggedIn();
		if (isLoggedIn) {
			profile = await this.user.getProfile();
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
}
