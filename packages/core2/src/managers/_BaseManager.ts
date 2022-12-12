import { SliceMachinePluginRunner } from "@slicemachine/plugin-kit";
import { PrismicAuthManager } from "../auth/PrismicAuthManager";

import { SliceMachineManager } from "./SliceMachineManager";
import { CustomTypesManager } from "./_CustomTypesManager";
import { PluginsManager } from "./_PluginsManager";
import { ProjectManager } from "./_ProjectManager";
import { SimulatorManager } from "./_SimulatorManager";
import { ScreenshotsManager } from "./_ScreenshotsManager";
import { SlicesManager } from "./_SlicesManager";
import { SnippetsManager } from "./_SnippetsManager";
import { UserManager } from "./_UserManager";
import { VersionsManager } from "./_VersionsManager";
import { AnalyticsManager } from "./_AnalyticsManager";

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
	protected get project(): ProjectManager {
		return this._sliceMachineManager.project;
	}
	protected get plugins(): PluginsManager {
		return this._sliceMachineManager.plugins;
	}
	protected get slices(): SlicesManager {
		return this._sliceMachineManager.slices;
	}
	protected get customTypes(): CustomTypesManager {
		return this._sliceMachineManager.customTypes;
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
	protected get analytics(): AnalyticsManager {
		return this._sliceMachineManager.analytics;
	}
}
