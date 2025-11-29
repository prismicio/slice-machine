import type { PrismicManager } from "@prismicio/manager";

import { version as pkgVersion } from "../../package.json";
import { detectProjectContext, detectProjectState } from "../core/project";
import { validateRepository } from "../core/repository";
import { saveSlices } from "../core/slices";
import { saveCustomTypes } from "../core/customType";
import { checkCLIVersion } from "../core/version";
import { displaySuccess } from "../utils/output";
import { login } from "../core/auth";

type SyncArgs = {
	manager: PrismicManager;
};

export async function sync(args: SyncArgs): Promise<void> {
	const { manager } = args;

	// Authentication - Also updates Sentry context
	await login(manager);

	// Ensure the project is already initialized
	await detectProjectState({ manager, commandType: "sync" });

	// Get repository from Prismic config file
	const repositoryName = await manager.project.getRepositoryName();

	// Ensure the repository exists and the user has write access
	await validateRepository({ manager, repository: repositoryName });

	// Ensure validity of the framework and package manager - Also updates Sentry context
	await detectProjectContext(manager);

	// Check CLI version - Voluntarily late so Sentry context is updated
	await checkCLIVersion({ manager, currentVersion: pkgVersion });

	// Initialize the plugin system
	await manager.plugins.initPlugins();

	// Save Prismic slices locally
	await saveSlices({ manager });

	// Save Prismic custom types locally
	await saveCustomTypes({ manager });

	await manager.telemetry.track({
		event: "prismic-cli:end",
		commandType: "sync",
		repository: repositoryName,
		fullCommand: process.argv.join(" "),
		success: true,
	});

	displaySuccess(
		"Sync completed successfully!",
		"Your local types are up to date.",
	);
}
