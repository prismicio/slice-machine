import { createPrismicManager } from "@prismicio/manager";

import { version as pkgVersion } from "../../package.json";
import { detectProjectContext, detectProjectState } from "../core/project";
import { validateRepository } from "../core/repository";
import { saveSlices } from "../core/slices";
import { saveCustomTypes } from "../core/customType";
import { checkCLIVersion } from "../core/version";
import { displaySuccess } from "../utils/output";
import { FRAMEWORK_PLUGINS } from "../core/framework";
import { login } from "../core/auth";

export async function sync(): Promise<void> {
	const manager = createPrismicManager({
		cwd: process.cwd(),
		nativePlugins: FRAMEWORK_PLUGINS,
	});

	// Authentication - Also update Sentry context
	await login(manager);

	// Ensure the project is already initialized
	await detectProjectState({ manager, command: "sync" });

	// Get repository from Prismic config file
	const repositoryName = await manager.project.getRepositoryName();

	// Ensure the repository exists and the user has write access
	await validateRepository({ manager, repository: repositoryName });

	// Ensure validity of the framework and package manager - Also update Sentry context
	await detectProjectContext(manager);

	// Check CLI version - Voluntarily late so Sentry context is updated
	await checkCLIVersion({ manager, currentVersion: pkgVersion });

	// Initialize the plugin system
	await manager.plugins.initPlugins();

	// Save Prismic slices locally
	await saveSlices({ manager });

	// Save Prismic custom types locally
	await saveCustomTypes({ manager });

	displaySuccess(
		"Sync completed successfully!",
		"Your local types are up to date.",
	);
}
