import { SliceMachinePluginRunner } from "@slicemachine/plugin-kit";

import { SliceMachineManager } from "../SliceMachineManager";

import { PluginsManager } from "./PluginsManager";
import { ProjectManager } from "./ProjectManager";
import { CustomTypesManager } from "./CustomTypesManager";
import { SlicesManager } from "./SlicesManager";
import { SnippetsManager } from "./SnippetsManager";
import { ScreenshotsManager } from "./ScreenshotsManager";
import { SimulatorManager } from "./SimulatorManager";
import { PrismicAuth } from "@slicemachine/auth";

export abstract class BaseManager {
	private _sliceMachineManager: SliceMachineManager;

	constructor(sliceMachineManager: SliceMachineManager) {
		this._sliceMachineManager = sliceMachineManager;
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
	protected get user(): PrismicAuth {
		return this._sliceMachineManager.user;
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
}
