import type {
	PackageManager,
	PrismicConfig,
	PrismicManager,
} from "@prismicio/manager";
import chalk from "chalk";

import { type Framework, detectFramework } from "../core/framework";
import { listr, listrRun } from "../utils/listr";

type DetectProjectStateArgs = {
	manager: PrismicManager;
	command: "init" | "sync";
};

export async function detectProjectState(
	args: DetectProjectStateArgs,
): Promise<void> {
	const { manager, command } = args;

	let prismicConfig: PrismicConfig | undefined;

	try {
		prismicConfig = await manager.project.getPrismicConfig();
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (_error) {
		// We want to manage the error depending on the need to be initialized or not
	}

	if (command === "init" && prismicConfig) {
		throw new Error("Project has already been initialized.");
	} else if (command === "sync" && !prismicConfig) {
		throw new Error("Project requires initialization before syncing.");
	}
}

export type ProjectContext = {
	framework: Framework;
	packageManager: PackageManager;
};

export async function detectProjectContext(
	manager: PrismicManager,
): Promise<ProjectContext> {
	let framework: Framework | undefined;
	let packageManager: PackageManager | undefined;

	await listrRun([
		{
			title: "Detecting environment...",
			task: (_, parentTask) =>
				listr([
					{
						title: "Detecting framework...",
						task: async (_, task) => {
							framework = await detectFramework(manager.cwd);

							task.title = `Detected framework ${chalk.cyan(framework.name)}`;
						},
					},
					{
						title: "Detecting package manager...",
						task: async (_, task) => {
							packageManager = await manager.project.detectPackageManager({
								root: manager.cwd,
							});

							task.title = `Detected package manager ${chalk.cyan(
								packageManager,
							)}`;

							if (!framework) {
								throw new Error(
									"Project framework must be available through context to proceed",
								);
							}

							parentTask.title = `Detected framework ${chalk.cyan(
								framework.name,
							)} and package manager ${chalk.cyan(packageManager)}`;
						},
					},
				]),
		},
	]);

	if (!framework) {
		throw new Error(
			"Project framework must be available through context to proceed",
		);
	}

	if (!packageManager) {
		throw new Error(
			"Project package manager must be available through context to proceed",
		);
	}

	return {
		framework,
		packageManager,
	};
}

type CreatePrismicConfigArgs = {
	manager: PrismicManager;
	projectContext: ProjectContext;
	repositoryName: string;
};

export async function createPrismicConfig(
	args: CreatePrismicConfigArgs,
): Promise<void> {
	const { manager, projectContext, repositoryName } = args;
	const { framework } = projectContext;

	return listrRun([
		{
			title: "Creating Prismic configuration...",
			task: async (_, parentTask) => {
				parentTask.title = "Creating Prismic configuration...";

				const prismicConfigPath =
					await manager.project.suggestPrismicConfigPath();

				await manager.project.writePrismicConfig({
					config: {
						repositoryName,
						adapter: framework.adapterName,
						libraries: ["./slices"],
					},
					path: prismicConfigPath,
				});

				parentTask.title = "Created Prismic configuration";
			},
		},
	]);
}
