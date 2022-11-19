import { SliceMachinePluginRunner } from "@slicemachine/plugin-kit";

import { SliceMachineManager } from "./SliceMachineManager";
import { CustomTypesManager } from "./_CustomTypesManager";
import { PluginsManager } from "./_PluginsManager";
import { ProjectManager } from "./_ProjectManager";
import { SlicesManager } from "./_SlicesManager";
import { UserManager } from "./_UserManager";
import { VersionsManger } from "./_VersionsManager";

export abstract class BaseManager {
	private _sliceMachineManager: SliceMachineManager;

	protected sliceMachinePluginRunner: SliceMachinePluginRunner | undefined;

	constructor(sliceMachineManager: SliceMachineManager) {
		this._sliceMachineManager = sliceMachineManager;
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
