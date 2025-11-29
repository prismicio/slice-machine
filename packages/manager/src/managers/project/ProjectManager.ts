import * as fs from "node:fs/promises";
import { existsSync } from "node:fs";
import * as path from "node:path";
import { detect as niDetect } from "@antfu/ni";
import { type ResultPromise } from "execa";

import { assertPluginsInitialized } from "../../lib/assertPluginsInitialized";
import { decodePrismicConfig } from "../../lib/decodePrismicConfig";
import { format } from "../../lib/format";
import { installDependencies } from "../../lib/installDependencies";
import { locateFileUpward } from "../../lib/locateFileUpward";

import { PackageManager, PrismicConfig } from "../../types";

import { PrismicError, InternalError } from "../../errors";

import { PRISMIC_CONFIG_FILENAME } from "../../constants/PRISMIC_CONFIG_FILENAME";
import { SLICEMACHINE_CONFIG_FILENAME } from "../../constants/SLICEMACHINE_CONFIG_FILENAME";
import { TS_CONFIG_FILENAME } from "../../constants/TS_CONFIG_FILENAME";

import { BaseManager } from "../BaseManager";

type ProjectManagerGetPrismicConfigPathArgs = {
	ignoreCache?: boolean;
};

type ProjectManagerGetRootArgs = {
	ignoreCache?: boolean;
};

type ProjectManagerCheckIsTypeScriptArgs = {
	rootOverride?: string;
};

type ProjectManagerWritePrismicConfigArgs = {
	config: PrismicConfig;
	path?: string;
};

type ProjectManagerInitProjectArgs = {
	log?: (message: string) => void;
};

type ProjectManagerDetectPackageManager = {
	root?: string;
};

type ProjectManagerInstallDependenciesArgs = {
	dependencies: Record<string, string>;
	dev?: boolean;
	packageManager?: PackageManager;
	log?: (message: string) => void;
};

type ProjectManagerInstallDependenciesReturnType = {
	execaProcess: ResultPromise;
};

export class ProjectManager extends BaseManager {
	private _cachedRoot: string | undefined;
	private _cachedPrismicConfigPath: string | undefined;
	private _cachedPrismicConfig: PrismicConfig | undefined;

	async getPrismicConfigPath(
		args?: ProjectManagerGetPrismicConfigPathArgs,
	): Promise<string> {
		if (this._cachedPrismicConfigPath && !args?.ignoreCache) {
			return this._cachedPrismicConfigPath;
		}

		try {
			this._cachedPrismicConfigPath = await locateFileUpward(
				PRISMIC_CONFIG_FILENAME,
				{ startDir: this.cwd },
			);
		} catch {
			throw new Error(
				`Could not find a ${PRISMIC_CONFIG_FILENAME} file. Please create a config file at the root of your project.`,
			);
		}

		return this._cachedPrismicConfigPath;
	}

	async getRoot(args?: ProjectManagerGetRootArgs): Promise<string> {
		if (this._cachedRoot && !args?.ignoreCache) {
			return this._cachedRoot;
		}

		const prismicConfigFilePath = await this.getPrismicConfigPath({
			ignoreCache: args?.ignoreCache,
		});

		this._cachedRoot = path.dirname(prismicConfigFilePath);

		return this._cachedRoot;
	}

	async suggestRoot(): Promise<string> {
		const suggestedRootPackageJSON = await locateFileUpward("package.json", {
			startDir: this.cwd,
		});

		return path.dirname(suggestedRootPackageJSON);
	}

	async suggestPrismicConfigPath(): Promise<string> {
		const suggestedRoot = await this.suggestRoot();

		return path.resolve(suggestedRoot, PRISMIC_CONFIG_FILENAME);
	}

	async checkIsTypeScript(
		args?: ProjectManagerCheckIsTypeScriptArgs,
	): Promise<boolean> {
		const root = args?.rootOverride || (await this.getRoot());
		const rootTSConfigPath = path.resolve(root, TS_CONFIG_FILENAME);

		// We just care if the file exists, we don't need access to it
		return existsSync(rootTSConfigPath);
	}

	async getPrismicConfig(): Promise<PrismicConfig> {
		if (this._cachedPrismicConfig) {
			return this._cachedPrismicConfig;
		} else {
			return await this.loadPrismicConfig();
		}
	}

	async writePrismicConfig(
		args: ProjectManagerWritePrismicConfigArgs,
	): Promise<void> {
		const configFilePath = args.path || (await this.getPrismicConfigPath());

		const config = await format(
			JSON.stringify(args.config, null, 2),
			configFilePath,
		);

		await fs.writeFile(configFilePath, config, "utf-8");

		// Clear config cache
		delete this._cachedPrismicConfig;
	}

	async loadPrismicConfig(): Promise<PrismicConfig> {
		const configFilePath = await this.getPrismicConfigPath();

		let rawConfig: unknown | undefined;
		try {
			const contents = await fs.readFile(configFilePath, "utf8");
			rawConfig = JSON.parse(contents);
		} catch (error) {
			if (error instanceof SyntaxError) {
				throw new PrismicError(
					`Could not parse config file at ${configFilePath}.\n\nError Message: ${error.message}`,
				);
			}

			// Noop, more specific error is thrown after
		}

		if (!rawConfig) {
			throw new Error(
				"No Prismic config found, please initialize your project with Prismic first.",
			);
		}

		const { value: prismicConfig, error } = decodePrismicConfig(rawConfig);

		if (error) {
			throw new Error(`Invalid Prismic config. ${error.errors.join(", ")}`, {
				cause: { rawConfig },
			});
		}

		this._cachedPrismicConfig = prismicConfig;

		return prismicConfig;
	}

	async getRepositoryName(): Promise<string> {
		const prismicConfig = await this.getPrismicConfig();

		return prismicConfig.repositoryName;
	}

	async checkLegacyConfigExists(): Promise<boolean> {
		try {
			await locateFileUpward(SLICEMACHINE_CONFIG_FILENAME, {
				startDir: this.cwd,
			});

			return true;
		} catch {
			return false;
		}
	}

	async migrateLegacyConfig(): Promise<void> {
		const suggestedRoot = await this.suggestRoot();
		const legacyConfigPath = path.resolve(
			suggestedRoot,
			SLICEMACHINE_CONFIG_FILENAME,
		);
		const newConfigPath = path.resolve(suggestedRoot, PRISMIC_CONFIG_FILENAME);

		// Check if legacy config exists
		try {
			await fs.access(legacyConfigPath);
		} catch {
			throw new Error(
				`Legacy config file ${SLICEMACHINE_CONFIG_FILENAME} not found.`,
			);
		}

		// Check if new config already exists
		try {
			await fs.access(newConfigPath);
			throw new Error(
				`Cannot migrate: ${PRISMIC_CONFIG_FILENAME} already exists.`,
			);
		} catch {
			// File doesn't exist, which is what we want
		}

		const legacyConfigContent = await fs.readFile(legacyConfigPath, "utf8");

		// Parse and validate the config
		let rawConfig: unknown;
		try {
			rawConfig = JSON.parse(legacyConfigContent);
		} catch (error) {
			if (error instanceof SyntaxError) {
				throw new PrismicError(
					`Could not parse legacy config file at ${legacyConfigPath}.\n\nError Message: ${error.message}`,
				);
			}
			throw error;
		}

		const { value: prismicConfig, error } = decodePrismicConfig(rawConfig);

		if (error) {
			throw new Error(
				`Invalid legacy Prismic config. ${error.errors.join(", ")}`,
				{
					cause: { rawConfig },
				},
			);
		}

		// Format and write the new config
		const formattedConfig = await format(
			JSON.stringify(prismicConfig, null, 2),
			newConfigPath,
		);

		await fs.writeFile(newConfigPath, formattedConfig, "utf-8");

		// Remove legacy config file
		await fs.unlink(legacyConfigPath);

		// Clear caches
		delete this._cachedPrismicConfig;
		delete this._cachedPrismicConfigPath;
		delete this._cachedRoot;
	}

	async initProject(args?: ProjectManagerInitProjectArgs): Promise<void> {
		assertPluginsInitialized(this.pluginSystemRunner);

		// eslint-disable-next-line no-console
		const log = args?.log || console.log.bind(this);

		const { errors } = await this.pluginSystemRunner.callHook("project:init", {
			log,
			installDependencies: async (args) => {
				const { execaProcess } = await this.installDependencies({
					dependencies: args.dependencies,
					dev: args.dev,
					log,
				});

				await execaProcess;
			},
		});

		if (errors.length > 0) {
			throw new PrismicError(
				`Failed to initialize project: ${errors.join(", ")}`,
			);
		}
	}

	async detectPackageManager(
		args?: ProjectManagerDetectPackageManager,
	): Promise<PackageManager> {
		const projectRoot = args?.root || (await this.getRoot());

		const packageManager = await niDetect({
			autoInstall: true,
			cwd: projectRoot,
		});

		return packageManager || "npm";
	}

	async installDependencies(
		args: ProjectManagerInstallDependenciesArgs,
	): Promise<ProjectManagerInstallDependenciesReturnType> {
		const packageManager =
			args.packageManager || (await this.detectPackageManager());

		// eslint-disable-next-line no-console
		const log = args.log || console.log.bind(this);

		const wrappedLogger = (data: Buffer | string | null) => {
			if (data instanceof Buffer) {
				log(data.toString());
			} else if (typeof data === "string") {
				log(data);
			}
		};

		try {
			const { execaProcess } = await installDependencies({
				packageManager,
				dependencies: args.dependencies,
				dev: args.dev,
			});

			// Don't clutter console with logs when process is non TTY (CI, etc.)
			if (process.stdout.isTTY || process.env.NODE_ENV === "test") {
				execaProcess.stdout?.on("data", wrappedLogger);
			}
			execaProcess.stderr?.on("data", wrappedLogger);

			return {
				execaProcess,
			};
		} catch (error) {
			if (
				error instanceof Error &&
				"shortMessage" in error &&
				"stderr" in error
			) {
				throw new InternalError("Package installation failed", {
					cause: error,
				});
			}

			throw error;
		}
	}
}
