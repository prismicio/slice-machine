import { type SliceMachineManager } from "@prismicio/manager";
import chalk from "chalk";

import { listrRun } from "../utils/listr";

import { type ProjectContext } from "./project";

type InstallDependenciesArgs = {
	manager: SliceMachineManager;
	projectContext: ProjectContext;
};

export async function installDependencies(
	args: InstallDependenciesArgs,
): Promise<void> {
	const { manager, projectContext } = args;
	const { packageManager } = projectContext;

	await listrRun([
		{
			title: `Installing Prismic dependencies with ${chalk.cyan(
				packageManager,
			)}...`,
			task: async (_, task) => {
				const updateOutput = (data: Buffer | string | null) => {
					if (data instanceof Buffer) {
						task.output = data.toString();
					} else if (typeof data === "string") {
						task.output = data;
					}
				};

				await manager.project.initProject({
					log: updateOutput,
				});

				task.title = `Installed Prismic dependencies with ${chalk.cyan(
					packageManager,
				)}`;
			},
		},
	]);
}
