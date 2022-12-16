import { SliceMachinePluginRunner } from "@slicemachine/plugin-kit";

import { PrismicAuthManager } from "../auth/PrismicAuthManager";

import { SliceMachineManager } from "./SliceMachineManager";
import { CustomTypesManager } from "./customTypes/CustomTypesManager";
import { PluginsManager } from "./plugins/PluginsManager";
import { PrismicRepositoryManager } from "./prismicRepository/PrismicRepositoryManager";
import { ProjectManager } from "./project/ProjectManager";
import { ScreenshotsManager } from "./screenshots/ScreenshotsManager";
import { SimulatorManager } from "./simulator/SimulatorManager";
import { SlicesManager } from "./slices/SlicesManager";
import { SnippetsManager } from "./snippets/SnippetsManager";
import { TelemetryManager } from "./telemetry/TelemetryManager";
import { UserManager } from "./user/UserManager";
import { VersionsManager } from "./versions/VersionsManager";

export abstract class BaseManager {
	private _sliceMachineManager: SliceMachineManager;

	constructor(sliceMachineManager: SliceMachineManager) {
		this._sliceMachineManager = sliceMachineManager;
	}

	protected get prismicAuthManager(): PrismicAuthManager {
		return this._sliceMachineManager.getPrismicAuthManager();
	}

	protected get sliceMachinePluginRunner():
		| SliceMachinePluginRunner
		| undefined {
		return this._sliceMachineManager.getSliceMachinePluginRunner();
	}

	protected set sliceMachinePluginRunner(
		sliceMachinePluginRunner: SliceMachinePluginRunner | undefined,
	) {
		// @ts-expect-error - _sliceMachinePluginRunner is private. We
		// are intentially ignoring its privacy to allow Manager
		// classes to access a shared plugin runner via protected
		// getters and setters.
		this._sliceMachineManager._sliceMachinePluginRunner =
			sliceMachinePluginRunner;
	}

	// Protected instance prevents circular intellisense
	// e.g. sliceMachineManager.user.user.user
	protected get user(): UserManager {
		return this._sliceMachineManager.user;
	}
	protected get prismicRepository(): PrismicRepositoryManager {
		return this._sliceMachineManager.prismicRepository;
	}

	protected get plugins(): PluginsManager {
		return this._sliceMachineManager.plugins;
	}

	protected get project(): ProjectManager {
		return this._sliceMachineManager.project;
	}
	protected get customTypes(): CustomTypesManager {
		return this._sliceMachineManager.customTypes;
	}
	protected get slices(): SlicesManager {
		return this._sliceMachineManager.slices;
	}
	protected get snippets(): SnippetsManager {
		return this._sliceMachineManager.snippets;
	}
	protected get screenshots(): ScreenshotsManager {
		return this._sliceMachineManager.screenshots;
	}
	protected get simulator(): SimulatorManager {
		return this._sliceMachineManager.simulator;
	}

	protected get versions(): VersionsManager {
		return this._sliceMachineManager.versions;
	}

	protected get telemetry(): TelemetryManager {
		return this._sliceMachineManager.telemetry;
	}
}
