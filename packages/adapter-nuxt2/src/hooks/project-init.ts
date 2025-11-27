import * as path from "node:path";
import type {
	ProjectInitHook,
	ProjectInitHookData,
	PluginSystemContext,
} from "@prismicio/plugin-kit";
import { checkHasProjectFile } from "@prismicio/plugin-kit/fs";
import { stripIndent } from "common-tags";
import { builders, loadFile, writeFile } from "magicast";

import { rejectIfNecessary } from "../lib/rejectIfNecessary";

import type { PluginOptions } from "../types";

const NUXT_PRISMIC = "@nuxtjs/prismic";

type InstallDependenciesArgs = {
	installDependencies: ProjectInitHookData["installDependencies"];
};

const installDependencies = async ({
	installDependencies,
}: InstallDependenciesArgs) => {
	await installDependencies({
		dependencies: {
			[NUXT_PRISMIC]: "^1.4.2",
		},
		dev: true,
	});
};

type ConfigurePrismicModuleArgs = PluginSystemContext<PluginOptions>;

const configurePrismicModule = async ({
	helpers,
	project,
}: ConfigurePrismicModuleArgs) => {
	let nuxtConfigFilename = "nuxt.config.js";

	if (!(await checkHasProjectFile({ filename: nuxtConfigFilename, helpers }))) {
		nuxtConfigFilename = "nuxt.config.ts";

		// nuxt.config.* not found
		if (
			!(await checkHasProjectFile({ filename: nuxtConfigFilename, helpers }))
		) {
			return;
		}
	}

	const nuxtConfigPath = helpers.joinPathFromRoot(nuxtConfigFilename);

	const mod = await loadFile(nuxtConfigPath);

	const endpoint =
		project.config.apiEndpoint ||
		`https://${project.config.repositoryName}.cdn.prismic.io/api/v2`;

	let config;
	try {
		config =
			mod.exports.default.$type === "function-call"
				? mod.exports.default.$args[0]
				: mod.exports.default;
	} catch {
		const errorMessage = `Failed to update ${path.basename(nuxtConfigPath)}`;
		console.error(errorMessage);
		console.warn(
			`Ensure that the following has been added to ${path.basename(
				nuxtConfigPath,
			)}.`,
		);
		console.warn(stripIndent`
			{
				buildModules: ["@nuxtjs/prismic"],
				prismic: {
					endpoint: "${endpoint}",
					modern: true
				}
			}
		`);

		throw errorMessage;
	}

	// Register Prismic module
	let hasInlinedConfiguration = false;
	const hasPrismicModuleRegistered = !![
		...(config.modules || []),
		...(config.buildModules || []),
	].find((registration: string | [string, unknown]) => {
		if (typeof registration === "string") {
			return registration === NUXT_PRISMIC;
		} else if (Array.isArray(registration)) {
			hasInlinedConfiguration = !!registration[1];

			return registration[0] === NUXT_PRISMIC;
		}

		return false;
	});

	if (!hasPrismicModuleRegistered) {
		config.buildModules ||= [];
		config.buildModules.push(NUXT_PRISMIC);
	}

	// Append Prismic module configuration
	if (!hasInlinedConfiguration) {
		// Import Prismic configuration
		mod.imports.$add({
			from: "./prismic.config.json",
			imported: "apiEndpoint",
		});
		mod.imports.$add({
			from: "./prismic.config.json",
			imported: "repositoryName",
		});

		// Add inline configuration
		if (config.prismic) {
			config.prismic.endpoint = builders.raw("apiEndpoint || repositoryName");
		} else {
			config.prismic = {
				endpoint: builders.raw("apiEndpoint || repositoryName"),
				modern: true,
			};
		}
	}

	await writeFile(mod, nuxtConfigPath);
};

const modifyPrismicConfig = async ({
	helpers,
	options,
	actions,
}: PluginSystemContext<PluginOptions>) => {
	const hasSrcDirectory = await checkHasProjectFile({
		filename: "src",
		helpers,
	});
	const project = await helpers.getProject();

	// Nest the default Slice Library in the src directory if it exists and
	// is empty.
	if (
		hasSrcDirectory &&
		project.config.libraries &&
		JSON.stringify(project.config.libraries) === JSON.stringify(["./slices"])
	) {
		const sliceLibrary = await actions.readSliceLibrary({
			libraryID: project.config.libraries[0],
		});

		if (sliceLibrary.sliceIDs.length < 1) {
			project.config.libraries = ["./src/slices"];
		}
	}

	await helpers.updatePrismicConfig(project.config, {
		format: options.format,
	});
};

export const projectInit: ProjectInitHook<PluginOptions> = async (
	{ installDependencies: _installDependencies },
	context,
) => {
	rejectIfNecessary(
		await Promise.allSettled([
			installDependencies({ installDependencies: _installDependencies }),
			configurePrismicModule(context),
			modifyPrismicConfig(context),
		]),
	);
};
