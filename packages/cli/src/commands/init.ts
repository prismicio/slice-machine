import { createPrismicManager } from "@prismicio/manager";

import { version as pkgVersion } from "../../package.json";
import { FRAMEWORK_PLUGINS, initFramework } from "../core/framework";
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
	repositoryName: string;
};

export async function init(args: InitArgs): Promise<void> {
	const { repositoryName } = args;

	const manager = createPrismicManager({
		cwd: process.cwd(),
		nativePlugins: FRAMEWORK_PLUGINS,
	});

	// Authentication - Also update Sentry context
	await login(manager);

	// Ensure the project is not already initialized
	await detectProjectState({ manager, command: "init" });

	// Ensure the repository exists and the user has write access
	await validateRepository({ manager, repository: repositoryName });

	// Get project framework and package manager - Also update Sentry context
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

	displaySuccess(
		"Project initialized successfully!",
		"You're all set to start building with Prismic.",
	);
}
