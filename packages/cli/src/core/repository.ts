import type { SliceMachineManager } from "@prismicio/manager";

import { listrRun } from "../utils/listr";

export type ValidateRepositoryArgs = {
	manager: SliceMachineManager;
	repository: string;
};

export async function validateRepository(
	args: ValidateRepositoryArgs,
): Promise<void> {
	const { manager, repository } = args;

	return listrRun([
		{
			title: `Validating repository...`,
			task: async (_, task) => {
				const repositoryExists = await manager.prismicRepository.checkExists({
					domain: repository,
				});
				if (!repositoryExists) {
					throw new Error(`Repository ${repository} does not exist.`);
				}

				const userRepositories = await manager.prismicRepository.readAll();
				const userSelectedRepository = userRepositories.find(
					(repo) => repo.domain === repository,
				);
				if (!userSelectedRepository) {
					throw new Error(`You're not part of the repository ${repository}.`);
				}

				const hasWriteAccess = await manager.prismicRepository.hasWriteAccess(
					userSelectedRepository,
				);
				if (!hasWriteAccess) {
					throw new Error(
						`You do not have administrator access to repository ${repository}.`,
					);
				}

				task.title = `Validated repository (${repository})`;
			},
		},
	]);
}
