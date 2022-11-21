import { SliceMachinePluginRunner } from "@slicemachine/plugin-kit";
import { PrismicAuthManager } from "../auth/PrismicAuthManager";

import { SliceMachineManager } from "./SliceMachineManager";
import { CustomTypesManager } from "./_CustomTypesManager";
import { PluginsManager } from "./_PluginsManager";
import { ProjectManager } from "./_ProjectManager";
import { SlicesManager } from "./_SlicesManager";
import { UserManager } from "./_UserManager";
import { VersionsManger } from "./_VersionsManager";

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
	protected get versions(): VersionsManger {
		return this._sliceMachineManager.versions;
	}
}
