import * as fs from "node:fs/promises";
import * as path from "node:path";
import { createRequire } from "node:module";

import { decodeSliceMachineConfig } from "../lib/decodeSliceMachineConfig";
import { loadModuleWithJiti } from "../lib/loadModuleWithJiti";
import { locateFileUpward } from "../lib/findFileUpward";

import {
	SLICE_MACHINE_CONFIG_FILENAMES,
	SLICE_MACHINE_NPM_PACKAGE_NAME,
} from "../constants";
import { SliceMachineConfig } from "../types";

import { BaseManager } from "./BaseManager";

export class ProjectManager extends BaseManager {
	private _cachedRoot: string | undefined;
	private _cachedSliceMachineConfig: SliceMachineConfig | undefined;

	async getRoot(): Promise<string> {
		if (this._cachedRoot) {
			return this._cachedRoot;
		}

		const sliceMachineConfigFilePath = await locateFileUpward(
			SLICE_MACHINE_CONFIG_FILENAMES,
		);

		this._cachedRoot = path.dirname(sliceMachineConfigFilePath);

		return this._cachedRoot;
	}

	async getSliceMachineConfig(): Promise<SliceMachineConfig> {
		if (this._cachedSliceMachineConfig) {
			return this._cachedSliceMachineConfig;
		} else {
			return await this.loadSliceMachineConfig();
		}
	}

	async loadSliceMachineConfig(): Promise<SliceMachineConfig> {
		const projectRoot = await this.getRoot();

		let configModule: unknown | undefined;

		for (const configFileName of SLICE_MACHINE_CONFIG_FILENAMES) {
			const configFilePath = path.resolve(projectRoot, configFileName);

			try {
				await fs.access(configFilePath);
				configModule = loadModuleWithJiti(path.resolve(configFileName));
			} catch {
				// noop
			}
		}

		if (!configModule) {
			// TODO: Write a more friendly and useful message.
			throw new Error("No config found.");
		}

		const { value: sliceMachineConfig, error } =
			decodeSliceMachineConfig(configModule);

		if (error) {
			// TODO: Write a more friendly and useful message.
			throw new Error(`Invalid config. ${error.errors.join(", ")}`);
		}

		// Allow cached config reading using `SliceMachineManager.prototype.getProjectConfig()`.
		this._cachedSliceMachineConfig = sliceMachineConfig;

		return sliceMachineConfig;
	}

	async getRunningSliceMachineVersion(): Promise<string> {
		const sliceMachineDir = await this.locateSliceMachineDir();

		const sliceMachinePackageJSONContents = await fs.readFile(
			path.join(sliceMachineDir, "package.json"),
			"utf8",
		);

		// TODO: Validate the contents? This code currently assumes a
		// well-formed document.
		const json = JSON.parse(sliceMachinePackageJSONContents);

		return json.version;
	}

	// TODO: Should this be renamed to `locateSliceMachineUIDir()` (note
	// the addition of "UI")?
	async locateSliceMachineDir(): Promise<string> {
		const projectRoot = await this.getRoot();

		const require = createRequire(path.join(projectRoot, "index.js"));
		const sliceMachinePackageJSONPath = require.resolve(
			`${SLICE_MACHINE_NPM_PACKAGE_NAME}/package.json`,
		);

		return path.dirname(sliceMachinePackageJSONPath);
	}
}
