import type { SliceMachineManager } from "@prismicio/manager";

import { detectProjectState } from "../core/project";
import { validateRepository } from "../core/repository";
import { saveSlices } from "../core/slices";
import { saveCustomTypes } from "../core/customType";

type SyncArgs = {
	manager: SliceMachineManager;
};

export async function sync(args: SyncArgs): Promise<void> {
	const { manager } = args;

	// Ensure the project is already initialized
	await detectProjectState({ manager, command: "sync" });

	// Get repository from Prismic config file
	const repositoryName = await manager.project.getRepositoryName();

	// Ensure the repository exists and the user has write access
	await validateRepository({ manager, repository: repositoryName });

	// Initialize the plugin system
	await manager.plugins.initPlugins();

	// Save Prismic slices locally
	await saveSlices({ manager });

	// Save Prismic custom types locally
	await saveCustomTypes({ manager });
}
