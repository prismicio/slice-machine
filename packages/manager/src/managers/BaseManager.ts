import { PluginSystemRunner } from "@prismicio/plugin-kit";
import { PrismicAuthManager } from "../auth/PrismicAuthManager";

import { PrismicManager } from "./PrismicManager";

import { UserManager } from "./user/UserManager";
import { PrismicRepositoryManager } from "./prismicRepository/PrismicRepositoryManager";

import { PluginsManager } from "./plugins/PluginsManager";

import { ProjectManager } from "./project/ProjectManager";
import { CustomTypesManager } from "./customTypes/CustomTypesManager";
import { SlicesManager } from "./slices/SlicesManager";

import { VersionsManager } from "./versions/VersionsManager";
import { TelemetryManager } from "./telemetry/TelemetryManager";

export abstract class BaseManager {
	private _prismicManager: PrismicManager;

	constructor(prismicManager: PrismicManager) {
		this._prismicManager = prismicManager;
	}

	protected get prismicAuthManager(): PrismicAuthManager {
		return this._prismicManager.getPrismicAuthManager();
	}

	protected get pluginSystemRunner(): PluginSystemRunner | undefined {
		return this._prismicManager.getPluginSystemRunner();
	}

	protected set pluginSystemRunner(
		pluginSystemRunner: PluginSystemRunner | undefined,
	) {
		// @ts-expect-error - _pluginSystemRunner is private. We
		// are intentially ignoring its privacy to allow Manager
		// classes to access a shared plugin runner via protected
		// getters and setters.
		this._prismicManager._pluginSystemRunner = pluginSystemRunner;
	}

	protected get cwd(): string {
		return this._prismicManager.cwd;
	}

	// Protected instance prevents circular intellisense
	// e.g. prismicManager.user.user.user
	protected get user(): UserManager {
		return this._prismicManager.user;
	}
	protected get prismicRepository(): PrismicRepositoryManager {
		return this._prismicManager.prismicRepository;
	}

	protected get plugins(): PluginsManager {
		return this._prismicManager.plugins;
	}

	protected get project(): ProjectManager {
		return this._prismicManager.project;
	}
	protected get customTypes(): CustomTypesManager {
		return this._prismicManager.customTypes;
	}
	protected get slices(): SlicesManager {
		return this._prismicManager.slices;
	}

	protected get versions(): VersionsManager {
		return this._prismicManager.versions;
	}

	protected get telemetry(): TelemetryManager {
		return this._prismicManager.telemetry;
	}
}
