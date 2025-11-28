import type { PrismicManager } from "@prismicio/manager";

import { listrRun } from "../utils/listr";

type SaveCustomTypesArgs = {
	manager: PrismicManager;
};

export async function saveCustomTypes(
	args: SaveCustomTypesArgs,
): Promise<void> {
	const { manager } = args;

	await listrRun([
		{
			title: "Fetching Prismic custom types...",
			task: async (_, parentTask) => {
				const customTypes = await manager.customTypes.fetchRemoteCustomTypes();

				parentTask.title = "Saving Prismic custom types changes...";

				const localCustomTypes = await manager.customTypes.readAllCustomTypes();

				// Handle custom types update
				for (const remoteCustomType of customTypes) {
					const existsLocally = localCustomTypes.models.some(
						(local) => local.model.id === remoteCustomType.id,
					);
					if (existsLocally) {
						await manager.customTypes.updateCustomType({
							model: remoteCustomType,
						});
					}
				}

				// Handle custom types deletion
				for (const localCustomType of localCustomTypes.models) {
					const existsRemotely = customTypes.some(
						(remote) => remote.id === localCustomType.model.id,
					);
					if (!existsRemotely) {
						await manager.customTypes.deleteCustomType({
							id: localCustomType.model.id,
						});
					}
				}

				// Handle custom types creation
				for (const remoteCustomType of customTypes) {
					const existsLocally = localCustomTypes.models.some(
						(local) => local.model.id === remoteCustomType.id,
					);
					if (!existsLocally) {
						await manager.customTypes.createCustomType({
							model: remoteCustomType,
						});
					}
				}

				parentTask.title = "Prismic custom types changes saved";
			},
		},
	]);
}
