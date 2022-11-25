import { readFile } from "node:fs/promises";
import { join } from "node:path";

import chalk from "chalk";
import semver from "semver";
import { ExecaChildProcess } from "execa";

import {
	createSliceMachineManager,
	SliceMachineManager,
} from "@slicemachine/core2";

import { Framework, FRAMEWORKS, VANILLA } from "./frameworks";
import { listrRun } from "./lib/listr";
import * as packageManager from "./lib/packageManager";

const Processes = {
	MainPackageManagerInstall: "MainPackageManagerInstall",
} as const;
type Processes = typeof Processes[keyof typeof Processes];

export type SliceMachineInitProcessOptions = {
	input: string[];
	repository?: string;
} & Record<string, unknown>;

export const createSliceMachineInitProcess = (
	options: SliceMachineInitProcessOptions
): SliceMachineInitProcess => {
	return new SliceMachineInitProcess(options);
};

export class SliceMachineInitProcess {
	protected options: SliceMachineInitProcessOptions;
	protected manager: SliceMachineManager;

	protected framework: Framework | null;
	protected packageManager: packageManager.Agent | null;
	protected processes: Map<Processes, ExecaChildProcess>;

	constructor(options: SliceMachineInitProcessOptions) {
		this.options = options;
		this.manager = createSliceMachineManager();

		this.framework = null;
		this.packageManager = null;
		this.processes = new Map();
	}

	async run(): Promise<void> {
		await listrRun([
			{
				title: "Detecting framework...",
				task: async (_, task) => {
					await this.detectFramework();

					if (this.framework) {
						task.title = `Detected framework ${chalk.cyan(
							this.framework.name
						)}`;
					} else {
						throw new Error("Failed to detect framework");
					}
				},
			},
			{
				title: "Begin core dependencies installation...",
				task: async (_, task) => {
					const agent = await packageManager.detect();

					if (!agent) {
						throw new Error("Failed to detect package manager");
					}

					this.packageManager = agent;

					// TODO: Support process error / watch & fail early
					const { execaProcess } = await packageManager.install({
						agent,
						dependencies: this.framework?.devDependencies,
						dev: true,
					});

					this.processes.set("MainPackageManagerInstall", execaProcess);

					task.title = `Began core dependencies installation with ${chalk.cyan(
						agent
					)} ... (running in background)`;
				},
			},
		]);

		await listrRun([
			{
				title: "💐 some",
				task: () => new Promise((res) => setTimeout(res, 500)),
			},
			{
				title: "👀 other",
				task: () => new Promise((res) => setTimeout(res, 500)),
			},
			{
				title: "💐 things",
				task: () => new Promise((res) => setTimeout(res, 500)),
			},
			{
				title: "👀 happening",
				task: () => new Promise((res) => setTimeout(res, 500)),
			},
		]);

		await listrRun([
			{
				title: `Finishing core dependencies installation with ${chalk.cyan(
					this.packageManager
				)} ...`,
				task: async (_, task) => {
					if (this.processes.has("MainPackageManagerInstall")) {
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						const execaProcess = this.processes.get(
							"MainPackageManagerInstall"
						)!;

						const updateOutput = (chunk: Buffer | null) => {
							if (chunk instanceof Buffer) {
								task.output = chunk.toString();
							}
						};
						execaProcess.stdout?.on("data", updateOutput);
						execaProcess.stderr?.on("data", updateOutput);

						await execaProcess;
					}

					task.title = `Core dependencies installed`;
				},
			},
		]);
	}

	async detectFramework(): Promise<void> {
		const path = join(process.cwd(), "package.json");

		let allDependencies: Record<string, string>;
		try {
			const pkg = JSON.parse(await readFile(path, "utf-8"));

			allDependencies = {
				...pkg.dependencies,
				...pkg.devDependencies,
			};
		} catch (error) {
			throw new Error(
				`Failed to read project's \`package.json\` at \`${path}\``,
				{ cause: error }
			);
		}

		this.framework =
			Object.values(FRAMEWORKS).find((framework) => {
				return Object.entries(framework.compatibility).every(([pkg, range]) => {
					if (pkg in allDependencies) {
						// Determine lowest version possibly in use
						const minimumVersion = semver.minVersion(allDependencies[pkg]);

						// Unconventional tags, `latest`, `beta`, `dev`
						if (!minimumVersion) {
							return true;
						}

						return semver.satisfies(minimumVersion, range);
					}

					return false;
				});
			}) || VANILLA;
	}
}
