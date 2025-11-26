import { BaseManager } from "../BaseManager";

export class VersionsManager extends BaseManager {
	async getRunningCLIVersion(): Promise<string> {
		// TODO
		return "1.0.0";
	}

	async getAllStableCLIVersions(): Promise<string[]> {
		// TODO
		return [];
	}

	async checkIsCliUpdateAvailable(): Promise<boolean> {
		// TODO
		return false;
	}
}
