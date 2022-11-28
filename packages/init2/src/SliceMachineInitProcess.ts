import chalk from "chalk";
import { ExecaChildProcess } from "execa";
import logSymbols from "log-symbols";
import prompts from "prompts";

import {
	createSliceMachineManager,
	PrismicUserProfile,
	PrismicRepository,
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
		userRepositories?: PrismicRepository[];
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
				title: "Logging in to Prismic...",
				task: async (_, task) => {
					try {
						task.output = "Validating session...";
						this.context.userProfile = await this.manager.user.getProfile();
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

						task.output = "Logged in! Fetching user profile...";
						this.context.userProfile = await this.manager.user.getProfile();
					}

					task.title = `Logged in as ${chalk.cyan(
						this.context.userProfile?.email
					)}`;
				},
			},
		]);

		await listrRun([
			{
				title: "Fetching user data...",
				task: async (_, task) => {
					this.context.userRepositories =
						await this.manager.repository.readAll();

					task.title = "Fetched user data";
				},
			},
		]);

		if (this.options.repository) {
			// TODO: Assert types
			const repositoryExists = this.context.userRepositories!.some(
				(repository) => repository.domain === this.options.repository
			);

			this.context.repository = {
				domain: this.options.repository,
				exists: repositoryExists,
			};
		} else {
			if (this.context.userRepositories!.length) {
				const maybeRepository = await prompts({
					type: "select",
					name: "value",
					message:
						"Pick a repository to connect to or choose to create a new one",
					warn: "You are not a developer or admin of this repository",
					choices: [
						{
							title: "CREATE NEW",
							description: "Create a new Prismic repository\n",
							value: "",
						},
						...this.context
							.userRepositories!.map((repository) => {
								const hasWriteAccess =
									this.manager.repository.hasWriteAccess(repository);

								return {
									title: `${repository.domain}${
										hasWriteAccess ? "" : " (Unauthorized)"
									}`,
									description: `Connect to ${chalk.cyan(repository.domain)}`,
									value: repository.domain,
									disabled: !hasWriteAccess,
								};
							})
							.sort((a, b) => (a.value > b.value ? 1 : -1)),
					],
				});
				// Clear prompt line, we'll recap cleanly later
				process.stdout.moveCursor(0, -1);
				process.stdout.clearLine(1);

				if (maybeRepository.value) {
					this.context.repository = {
						domain: maybeRepository.value,
						exists: true,
					};
				}
			}

			if (!this.context.repository) {
				// TODO: Prompt for repository
			}
		}
		console.log(
			`${logSymbols.success} Selected repository ${chalk.cyan(
				this.context.repository!.domain
			)}`
		);

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
