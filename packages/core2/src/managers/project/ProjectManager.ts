import * as fs from "node:fs/promises";
import { existsSync } from "node:fs";
import * as path from "node:path";
import { createRequire } from "node:module";

import { decodeSliceMachineConfig } from "../../lib/decodeSliceMachineConfig";
import { loadModuleWithJiti } from "../../lib/loadModuleWithJiti";
import { locateFileUpward } from "../../lib/locateFileUpward";

import {
	SLICE_MACHINE_CONFIG_FILENAMES,
	SLICE_MACHINE_CONFIG_JS,
	SLICE_MACHINE_CONFIG_TS,
	SLICE_MACHINE_NPM_PACKAGE_NAME,
	TS_CONFIG_FILENAME,
} from "../../constants";
import { SliceMachineConfig } from "../../types";

import { BaseManager } from "../BaseManager";

export class ProjectManager extends BaseManager {
	private _cachedRoot: string | undefined;
	private _cachedSliceMachineConfigPath: string | undefined;
	private _cachedSliceMachineConfig: SliceMachineConfig | undefined;

	async getSliceMachineConfigPath(ignoreCache?: boolean): Promise<string> {
		if (this._cachedSliceMachineConfigPath && !ignoreCache) {
			return this._cachedSliceMachineConfigPath;
		}

		try {
			this._cachedSliceMachineConfigPath = await locateFileUpward(
				SLICE_MACHINE_CONFIG_FILENAMES,
			);
		} catch (error) {
			const formattedSliceMachineConfigFilePaths =
				SLICE_MACHINE_CONFIG_FILENAMES.map(
					(filePath) => `\`${filePath}\``,
				).join(" or ");

			throw new Error(
				`Could not find a ${formattedSliceMachineConfigFilePaths} file. Please create a config file at the root of your project.`,
			);
		}

		return this._cachedSliceMachineConfigPath;
	}

	async getRoot(ignoreCache?: boolean): Promise<string> {
		if (this._cachedRoot && !ignoreCache) {
			return this._cachedRoot;
		}

		const sliceMachineConfigFilePath = await this.getSliceMachineConfigPath(
			ignoreCache,
		);

		this._cachedRoot = path.dirname(sliceMachineConfigFilePath);

		return this._cachedRoot;
	}

	async suggestSliceMachineConfigPath(root: string): Promise<string> {
		const isTypeScript = await this.checkIsTypeScript(root);

		return path.resolve(
			root,
			isTypeScript ? SLICE_MACHINE_CONFIG_TS : SLICE_MACHINE_CONFIG_JS,
		);
	}

	async checkIsTypeScript(rootOverwrite?: string): Promise<boolean> {
		const root = rootOverwrite || (await this.getRoot());
		const rootTSConfigPath = path.resolve(root, TS_CONFIG_FILENAME);

		// We just care if the file exists, we don't need access to it
		return existsSync(rootTSConfigPath);
	}

	async getSliceMachineConfig(): Promise<SliceMachineConfig> {
		if (this._cachedSliceMachineConfig) {
			return this._cachedSliceMachineConfig;
		} else {
			return await this.loadSliceMachineConfig();
		}
	}

	// TODO: This is a temporary strategy for upading Slice Machine configuration based on string search & replace, e.g. `this.updateSliceMachineConfig({ "200629-sms-hoy": /__PRISMIC_REPOSITORY_NAME/g })` replaces all occurence of "__PRISMIC_REPOSITORY_NAME" with "200629-sms-hoy". We'll need something stronger/more convenient for starters.
	async updateSliceMachineConfig(
		searchAndReplaceMap: Record<string, string | RegExp>,
	): Promise<void> {
		const configFilePath = await this.getSliceMachineConfigPath();

		let rawConfig = await fs.readFile(configFilePath, "utf-8");

		for (const replacement in searchAndReplaceMap) {
			const searchPattern = searchAndReplaceMap[replacement];

			rawConfig = rawConfig.replace(searchPattern, replacement);
		}

		await fs.writeFile(configFilePath, rawConfig);
		delete this._cachedSliceMachineConfig; // Clear config cache
	}

	async loadSliceMachineConfig(): Promise<SliceMachineConfig> {
		// TODO: Reload plugins with a fresh plugin runner. Plugins may
		// have been added or removed.

		const configFilePath = await this.getSliceMachineConfigPath();

		let configModule: unknown | undefined;
		try {
			await fs.access(configFilePath);
			configModule = loadModuleWithJiti(path.resolve(configFilePath));
		} catch {
			// noop
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
		const sliceMachineDir = await this.locateSliceMachineUIDir();

		const sliceMachinePackageJSONContents = await fs.readFile(
			path.join(sliceMachineDir, "package.json"),
			"utf8",
		);

		// TODO: Validate the contents? This code currently assumes a
		// well-formed document.
		const json = JSON.parse(sliceMachinePackageJSONContents);

		return json.version;
	}

	async locateSliceMachineUIDir(): Promise<string> {
		const projectRoot = await this.getRoot();

		const require = createRequire(path.join(projectRoot, "index.js"));
		const sliceMachinePackageJSONPath = require.resolve(
			`${SLICE_MACHINE_NPM_PACKAGE_NAME}/package.json`,
		);

		return path.dirname(sliceMachinePackageJSONPath);
	}
}
