import type { PrismicManager } from "@prismicio/manager";

import { version as pkgVersion } from "../../package.json";
import { initFramework } from "../core/framework";
import {
	createPrismicConfig,
	detectProjectContext,
	detectProjectState,
} from "../core/project";
import { validateRepository } from "../core/repository";
import { saveCustomTypes } from "../core/customType";
import { saveSlices } from "../core/slices";
import { checkCLIVersion } from "../core/version";
import { displaySuccess } from "../utils/output";
import { login } from "../core/auth";

type InitArgs = {
	manager: PrismicManager;
	repositoryName: string;
};

export async function init(args: InitArgs): Promise<void> {
	const { manager, repositoryName } = args;

	// Authentication - Also updates Sentry context
	await login(manager);

	// Ensure the project is not already initialized
	await detectProjectState({ manager, commandType: "init" });

	// Ensure the repository exists and the user has write access
	await validateRepository({ manager, repository: repositoryName });

	// Get project framework and package manager - Also updates Sentry context
	const projectContext = await detectProjectContext(manager);

	// Check CLI version - Voluntarily late so Sentry context is updated
	await checkCLIVersion({ manager, currentVersion: pkgVersion });

	// Create Prismic configuration file
	await createPrismicConfig({ manager, projectContext, repositoryName });

	// Initialize the plugin system
	await manager.plugins.initPlugins();

	// Initialize the framework specific dependencies and files
	await initFramework({ manager, projectContext });

	// Save Prismic slices locally
	await saveSlices({ manager });

	// Save Prismic custom types locally
	await saveCustomTypes({ manager });

	// Track the end of the init command
	await manager.telemetry.track({
		event: "prismic-cli:end",
		commandType: "init",
		repository: repositoryName,
		fullCommand: process.argv.join(" "),
		success: true,
	});

	displaySuccess(
		"Project initialized successfully!",
		"You're all set to start building with Prismic.",
	);
}
