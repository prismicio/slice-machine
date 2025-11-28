import { Plugin, PluginSystemRunner } from "@prismicio/plugin-kit";

import { PrismicAuthManager } from "../auth/PrismicAuthManager";
import { createPrismicAuthManager } from "../auth/createPrismicAuthManager";
import { API_ENDPOINTS, APIEndpoints } from "../constants/API_ENDPOINTS";

import { UserManager } from "./user/UserManager";
import { PrismicRepositoryManager } from "./prismicRepository/PrismicRepositoryManager";
import { PluginsManager } from "./plugins/PluginsManager";
import { ProjectManager } from "./project/ProjectManager";
import { CustomTypesManager } from "./customTypes/CustomTypesManager";
import { SlicesManager } from "./slices/SlicesManager";
import { VersionsManager } from "./versions/VersionsManager";
import { TelemetryManager } from "./telemetry/TelemetryManager";

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
	// discourage access. Using a function deliberately breaks the pattern
	// of other child managers that are accessible as properties, like
	// `project`, `plugins`, etc. We do not treat PluginSystemRunner
	// as a child manager.
	getPluginSystemRunner(): PluginSystemRunner | undefined {
		return this._pluginSystemRunner;
	}

	// The `_prismicAuthManager` property is hidden behind a function to
	// discourage access. Using a function deliberately breaks the pattern
	// of other child managers that are accessible as properties, like
	// `project`, `plugins`, etc. We do not treat PrismicAuthManager as a
	// child manager.
	getPrismicAuthManager(): PrismicAuthManager {
		return this._prismicAuthManager;
	}

	getAPIEndpoints(): APIEndpoints {
		return API_ENDPOINTS;
	}
}
