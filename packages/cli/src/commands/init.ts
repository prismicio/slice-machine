import type { SliceMachineManager } from "@prismicio/manager";

// import { installDependencies } from "../core/dependencies"
import { initFramework } from "../core/framework";
import {
	createPrismicConfig,
	detectProjectContext,
	detectProjectState,
} from "../core/project";
import { validateRepository } from "../core/repository";

import { sync } from "./sync";

type InitArgs = {
	manager: SliceMachineManager;
	repositoryName: string;
};

export async function init(args: InitArgs): Promise<void> {
	const { manager, repositoryName } = args;

	// Ensure the project is not already initialized
	await detectProjectState({ manager, command: "init" });

	// Ensure the repository exists and the user has write access
	await validateRepository({ manager, repository: repositoryName });

	// Get project framework and package manager
	const projectContext = await detectProjectContext(manager);

	// Create Prismic configuration file
	await createPrismicConfig({ manager, projectContext, repositoryName });

	// Initialize the plugin system
	await manager.plugins.initPlugins();

	// Initialize the framework specific dependencies and files
	await initFramework({ manager, projectContext });

	// Finally sync the project to directly pull changes from Prismic
	await sync({ manager });
}
