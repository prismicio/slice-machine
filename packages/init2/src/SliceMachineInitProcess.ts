import chalk from "chalk";
import { ExecaChildProcess } from "execa";

import {
	createSliceMachineManager,
	PrismicUserProfile,
	SliceMachineManager,
} from "@slicemachine/core2";

import * as framework from "./framework";
import { listr, listrRun } from "./lib/listr";
import * as packageManager from "./lib/packageManager";

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

	protected context: {
		framework?: framework.Framework;
		packageManager?: packageManager.Agent;
		installProcess?: ExecaChildProcess;
		userProfile?: PrismicUserProfile;
		repository?: {
			domain: string;
			exists: boolean;
		};
	};

	constructor(options: SliceMachineInitProcessOptions) {
		this.options = options;
		this.manager = createSliceMachineManager();

		this.context = {};
	}

	async run(): Promise<void> {
		await listrRun([
			{
				title: "Detecting environment...",
				task: (_, parentTask) =>
					listr([
						{
							title: "Detecting framework...",
							task: async (_, task) => {
								this.context.framework = await framework.detect();

								task.title = `Detected framework ${chalk.cyan(
									this.context.framework.name
								)}`;
							},
						},
						{
							title: "Detecting package manager...",
							task: async (_, task) => {
								this.context.packageManager = await packageManager.detect();

								task.title = `Detected package manager ${chalk.cyan(
									this.context.packageManager
								)}`;

								parentTask.title = `Detected framework ${chalk.cyan(
									this.context.framework?.name
								)} and package manager ${chalk.cyan(
									this.context.packageManager
								)}`;
							},
						},
					]),
			},
		]);

		await listrRun([
			{
				title: "Beginning core dependencies installation...",
				task: async (_, task) => {
					const { execaProcess } = await packageManager.install({
						// TODO: Assert types
						agent: this.context.packageManager!,
						dependencies: this.context.framework!.devDependencies,
						dev: true,
					});

					this.context.installProcess = execaProcess;

					task.title = `Began core dependencies installation with ${chalk.cyan(
						this.context.packageManager
					)} ... (running in background)`;
				},
			},
		]);

		await listrRun([
			{
				title: "Setting up Prismic...",
				task: (_, _parentTask) =>
					listr([
						{
							title: "Logging in...",
							task: async (_, task) => {
								try {
									this.context.userProfile =
										await this.manager.user.getProfile();
								} catch {
									// noop
								}

								if (!this.context.userProfile) {
									task.output = "Press any key to open the browser to login...";
									await new Promise((resolve) => {
										const initialRawMode = process.stdin.isRaw;
										process.stdin.setRawMode(true);
										process.stdin.once("data", (data: Buffer) => {
											process.stdin.setRawMode(initialRawMode);
											process.stdin.pause();
											resolve(data.toString("utf-8"));
										});
									});

									task.output = "Browser opened, waiting for you to login...";
									await this.manager.user.browserLogin();

									this.context.userProfile =
										await this.manager.user.getProfile();
								}

								task.title = `Logged in as ${chalk.cyan(
									this.context.userProfile?.email
								)}`;
							},
						},
						{
							title: "Selecting repository...",
							task: async (_, task) => {
								const userRepositories =
									await this.manager.repository.readAll();

								if (this.options.repository) {
									const repositoryExists = userRepositories.some(
										(repository) =>
											repository.domain === this.options.repository
									);

									this.context.repository = {
										domain: this.options.repository,
										exists: repositoryExists,
									};
								}

								task.title = `Selected repository ${chalk.cyan(
									JSON.stringify(this.context.repository)
								)}`;
							},
						},
						{
							title: "Creating repository...",
							task: () => new Promise((res) => setTimeout(res, 2000)),
						},
					]),
			},
		]);

		await listrRun([
			{
				title: `Finishing core dependencies installation with ${chalk.cyan(
					this.context.packageManager
				)} ...`,
				task: async (_, task) => {
					const updateOutput = (data: Buffer | null) => {
						if (data instanceof Buffer) {
							task.output = data.toString();
						}
					};
					// TODO: Assert types
					this.context.installProcess!.stdout?.on("data", updateOutput);
					this.context.installProcess!.stderr?.on("data", updateOutput);

					await this.context.installProcess;

					task.title = `Core dependencies installed with ${chalk.cyan(
						this.context.packageManager
					)}`;
				},
			},
		]);

		await listrRun([
			{
				title: "Finishing Slice Machine installation",
				task: (_, _parentTask) =>
					listr([
						{
							title: "Project (wip)",
							task: () => new Promise((res) => setTimeout(res, 1000)),
						},
						{
							title: `${chalk.cyan(
								this.context.framework?.name
							)} adapter (wip)`,
							task: () => new Promise((res) => setTimeout(res, 1000)),
						},
					]),
			},
		]);
	}
}
