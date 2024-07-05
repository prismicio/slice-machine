import * as fs from "node:fs/promises";
import { existsSync } from "node:fs";
import * as path from "node:path";
import { detect as niDetect } from "@antfu/ni";
import { ExecaChildProcess } from "execa";
import {
	HookError,
	CallHookReturnType,
	ProjectEnvironmentUpdateHook,
} from "@slicemachine/plugin-kit";
import * as t from "io-ts";

import { DecodeError } from "../../lib/DecodeError";
import { assertPluginsInitialized } from "../../lib/assertPluginsInitialized";
import { decodeHookResult } from "../../lib/decodeHookResult";
import { decodeSliceMachineConfig } from "../../lib/decodeSliceMachineConfig";
import { findEnvironment } from "../../lib/findEnvironment";
import { format } from "../../lib/format";
import { installDependencies } from "../../lib/installDependencies";
import { locateFileUpward } from "../../lib/locateFileUpward";
import { requireResolve } from "../../lib/requireResolve";

import {
	PackageManager,
	SliceMachineConfig,
	OnlyHookErrors,
} from "../../types";

import {
	SliceMachineError,
	InternalError,
	PluginError,
	InvalidActiveEnvironmentError,
} from "../../errors";

import { SLICE_MACHINE_CONFIG_FILENAME } from "../../constants/SLICE_MACHINE_CONFIG_FILENAME";
import { TS_CONFIG_FILENAME } from "../../constants/TS_CONFIG_FILENAME";
import { SLICE_MACHINE_NPM_PACKAGE_NAME } from "../../constants/SLICE_MACHINE_NPM_PACKAGE_NAME";

import { BaseManager } from "../BaseManager";
import { Environment } from "../prismicRepository/types";

type ProjectManagerGetSliceMachineConfigPathArgs = {
	ignoreCache?: boolean;
};

type ProjectManagerGetRootArgs = {
	ignoreCache?: boolean;
};

type ProjectManagerCheckIsTypeScriptArgs = {
	rootOverride?: string;
};

type ProjectManagerWriteSliceMachineConfigArgs = {
	config: SliceMachineConfig;
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
	execaProcess: ExecaChildProcess;
};

type ProjectManagerReadEnvironmentReturnType = {
	environment: string | undefined;
	errors: (DecodeError | HookError)[];
};

type ProjectManagerUpdateEnvironmentArgs = {
	environment: string | undefined;
};

type ProjectManagerFetchActiveEnvironmentReturnType = {
	activeEnvironment: Environment;
};

export class ProjectManager extends BaseManager {
	private _cachedRoot: string | undefined;
	private _cachedSliceMachineConfigPath: string | undefined;
	private _cachedSliceMachineConfig: SliceMachineConfig | undefined;
	private _cachedEnvironments: Environment[] | undefined;

	async getSliceMachineConfigPath(
		args?: ProjectManagerGetSliceMachineConfigPathArgs,
	): Promise<string> {
		if (this._cachedSliceMachineConfigPath && !args?.ignoreCache) {
			return this._cachedSliceMachineConfigPath;
		}

		try {
			this._cachedSliceMachineConfigPath = await locateFileUpward(
				SLICE_MACHINE_CONFIG_FILENAME,
				{ startDir: this.cwd },
			);
		} catch (error) {
			throw new Error(
				`Could not find a ${SLICE_MACHINE_CONFIG_FILENAME} file. Please create a config file at the root of your project.`,
			);
		}

		return this._cachedSliceMachineConfigPath;
	}

	async getRoot(args?: ProjectManagerGetRootArgs): Promise<string> {
		if (this._cachedRoot && !args?.ignoreCache) {
			return this._cachedRoot;
		}

		const sliceMachineConfigFilePath = await this.getSliceMachineConfigPath({
			ignoreCache: args?.ignoreCache,
		});

		this._cachedRoot = path.dirname(sliceMachineConfigFilePath);

		return this._cachedRoot;
	}

	async suggestRoot(): Promise<string> {
		const suggestedRootPackageJSON = await locateFileUpward("package.json", {
			startDir: this.cwd,
		});

		return path.dirname(suggestedRootPackageJSON);
	}

	async suggestSliceMachineConfigPath(): Promise<string> {
		const suggestedRoot = await this.suggestRoot();

		return path.resolve(suggestedRoot, SLICE_MACHINE_CONFIG_FILENAME);
	}

	async checkIsTypeScript(
		args?: ProjectManagerCheckIsTypeScriptArgs,
	): Promise<boolean> {
		const root = args?.rootOverride || (await this.getRoot());
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

	async writeSliceMachineConfig(
		args: ProjectManagerWriteSliceMachineConfigArgs,
	): Promise<void> {
		const configFilePath =
			args.path || (await this.getSliceMachineConfigPath());

		const config = await format(
			JSON.stringify(args.config, null, 2),
			configFilePath,
		);

		await fs.writeFile(configFilePath, config, "utf-8");
		delete this._cachedSliceMachineConfig; // Clear config cache
	}

	async loadSliceMachineConfig(): Promise<SliceMachineConfig> {
		// TODO: Reload plugins with a fresh plugin runner. Plugins may
		// have been added or removed.
		const configFilePath = await this.getSliceMachineConfigPath();

		let rawConfig: unknown | undefined;
		try {
			const contents = await fs.readFile(configFilePath, "utf8");
			rawConfig = JSON.parse(contents);
		} catch (error) {
			if (error instanceof SyntaxError) {
				throw new SliceMachineError(
					`Could not parse config file at ${configFilePath}.\n\nError Message: ${error.message}`,
				);
			}

			// Noop, more specific error is thrown after
		}

		if (!rawConfig) {
			// TODO: Write a more friendly and useful message.
			throw new Error("No config found.");
		}

		const { value: sliceMachineConfig, error } =
			decodeSliceMachineConfig(rawConfig);

		if (error) {
			// TODO: Write a more friendly and useful message.
			throw new Error(`Invalid config. ${error.errors.join(", ")}`, {
				cause: { rawConfig },
			});
		}

		// Allow cached config reading using `SliceMachineManager.prototype.getProjectConfig()`.
		this._cachedSliceMachineConfig = sliceMachineConfig;

		return sliceMachineConfig;
	}

	async locateSliceMachineUIDir(): Promise<string> {
		const projectRoot = await this.getRoot();

		const sliceMachinePackageJSONPath = requireResolve(
			`${SLICE_MACHINE_NPM_PACKAGE_NAME}/package.json`,
			path.join(projectRoot, "index.js"),
		);

		return path.dirname(sliceMachinePackageJSONPath);
	}

	/**
	 * Returns the project's repository name (i.e. the production environment). It
	 * ignores the currently selected environment.
	 *
	 * Use this method to retrieve the production environment domain.
	 *
	 * @returns The project's repository name.
	 */
	async getRepositoryName(): Promise<string> {
		const sliceMachineConfig = await this.getSliceMachineConfig();

		return sliceMachineConfig.repositoryName;
	}

	/**
	 * Returns the currently selected environment domain if set. If an environment
	 * is not set, it returns the project's repository name (the production
	 * environment).
	 *
	 * Use this method to retrieve the repository name to be sent with Prismic API
	 * requests.
	 *
	 * @returns The resolved repository name.
	 */
	async getResolvedRepositoryName(): Promise<string> {
		const repositoryName = await this.getRepositoryName();

		const supportsEnvironments = this.project.checkSupportsEnvironments();
		if (!supportsEnvironments) {
			return repositoryName;
		}

		const { environment } = await this.project.readEnvironment();

		return environment ?? repositoryName;
	}

	async getAdapterName(): Promise<string> {
		const sliceMachineConfig = await this.getSliceMachineConfig();
		const adapterName =
			typeof sliceMachineConfig.adapter === "string"
				? sliceMachineConfig.adapter
				: sliceMachineConfig.adapter.resolve;

		return adapterName;
	}

	async locateAdapterDir(): Promise<string> {
		const projectRoot = await this.getRoot();
		const adapterName = await this.getAdapterName();
		const adapterPackageJSONPath = requireResolve(
			`${adapterName}/package.json`,
			path.join(projectRoot, "index.js"),
		);

		return path.dirname(adapterPackageJSONPath);
	}

	async initProject(args?: ProjectManagerInitProjectArgs): Promise<void> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		// eslint-disable-next-line no-console
		const log = args?.log || console.log.bind(this);

		const { errors } = await this.sliceMachinePluginRunner.callHook(
			"project:init",
			{
				log,
				installDependencies: async (args) => {
					const { execaProcess } = await this.installDependencies({
						dependencies: args.dependencies,
						dev: args.dev,
						log,
					});

					await execaProcess;
				},
			},
		);

		if (errors.length > 0) {
			// TODO: Provide better error message.
			throw new SliceMachineError(
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

	checkSupportsEnvironments(): boolean {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		return (
			this.sliceMachinePluginRunner.hooksForType("project:environment:read")
				.length > 0 &&
			this.sliceMachinePluginRunner.hooksForType("project:environment:update")
				.length > 0
		);
	}

	async readEnvironment(): Promise<ProjectManagerReadEnvironmentReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		await this._assertAdapterSupportsEnvironments();

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"project:environment:read",
			undefined,
		);
		const { data, errors } = decodeHookResult(
			t.type({
				environment: t.union([t.undefined, t.string]),
			}),
			hookResult,
		);

		// An undefined value is equivalent to the production environment.
		// We cast to undefined.
		const repositoryName = await this.project.getRepositoryName();
		const environmentDomain =
			data[0]?.environment === repositoryName
				? undefined
				: data[0]?.environment;

		return {
			environment: environmentDomain,
			errors,
		};
	}

	async updateEnvironment(
		args: ProjectManagerUpdateEnvironmentArgs,
	): Promise<OnlyHookErrors<CallHookReturnType<ProjectEnvironmentUpdateHook>>> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		await this._assertAdapterSupportsEnvironments();

		const repositoryName = await this.project.getRepositoryName();
		const environment =
			args.environment === repositoryName ? undefined : args.environment;

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"project:environment:update",
			{ environment },
		);

		return {
			errors: hookResult.errors,
		};
	}

	async fetchActiveEnvironment(): Promise<ProjectManagerFetchActiveEnvironmentReturnType> {
		const { environment: activeEnvironmentDomain } =
			await this.readEnvironment();

		// We can assume an environment cannot change its kind. If the
		// environment exists in the cached list, we are confident it
		// will not change.
		const cachedActiveEnvironment = findEnvironment(
			activeEnvironmentDomain,
			this._cachedEnvironments || [],
		);
		if (cachedActiveEnvironment) {
			return { activeEnvironment: cachedActiveEnvironment };
		}

		// If the environment is not in the cached environments list, we
		// must fetch a fresh list and set the cache.
		const { environments } = await this.prismicRepository.fetchEnvironments();
		// TODO: Remove the wrapping if statement when
		// `this.prismicRepository.fetchEnvironments()` is able to throw
		// normally. The method returns an object with an `error`
		// property at the time of this writing, which means we need to
		// check if the `environments` property exists.
		if (environments) {
			this._cachedEnvironments = environments;
		}

		const activeEnvironment = findEnvironment(
			activeEnvironmentDomain,
			this._cachedEnvironments || [],
		);

		if (!activeEnvironment) {
			throw new InvalidActiveEnvironmentError();
		}

		return { activeEnvironment };
	}

	async detectVersionControlSystem(): Promise<string | "_unknown"> {
		try {
			const projectRoot = await this.getRoot();

			if (existsSync(path.join(projectRoot, ".git"))) {
				return "Git";
			}

			if (existsSync(path.join(projectRoot, ".svn"))) {
				return "SVN";
			}

			if (existsSync(path.join(projectRoot, ".hg"))) {
				return "Mercurial";
			}

			if (existsSync(path.join(projectRoot, "CVS"))) {
				return "CVS";
			}
		} catch (error) {
			if (import.meta.env.DEV) {
				console.error("Failed to detect Version Control System:", error);
			}
		}

		return "_unknown";
	}

	private async _assertAdapterSupportsEnvironments(): Promise<void> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const supportsEnvironments = this.checkSupportsEnvironments();

		if (!supportsEnvironments) {
			const adapterName = await this.project.getAdapterName();

			throw new PluginError(
				`${adapterName} does not support environments. Use an adapter that implements the \`project:environment:read\` and \`project:environment:update\` hooks to use environments.`,
			);
		}
	}
}
