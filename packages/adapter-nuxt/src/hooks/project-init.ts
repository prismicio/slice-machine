import * as path from "node:path";
import type {
	ProjectInitHook,
	ProjectInitHookData,
	PluginSystemContext,
} from "@prismicio/plugin-kit";
import {
	checkHasProjectFile,
	deleteProjectFile,
	readProjectFile,
	writeProjectFile,
} from "@prismicio/plugin-kit/fs";
import { builders, loadFile, writeFile } from "magicast";

import { buildSrcPath } from "../lib/buildSrcPath";
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
			[NUXT_PRISMIC]: "^4.0.0",
		},
		dev: true,
	});
};

type ConfigurePrismicModuleArgs = PluginSystemContext<PluginOptions>;

const configurePrismicModule = async ({
	helpers,
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
	const config =
		mod.exports.default.$type === "function-call"
			? mod.exports.default.$args[0]
			: mod.exports.default;

	// Register Prismic module
	let hasInlinedConfiguration = false;
	const hasPrismicModuleRegistered = (config.modules || []).find(
		(registration: string | [string, unknown]) => {
			if (typeof registration === "string") {
				return registration === NUXT_PRISMIC;
			} else if (Array.isArray(registration)) {
				hasInlinedConfiguration = !!registration[1];

				return registration[0] === NUXT_PRISMIC;
			}

			return false;
		},
	);

	if (!hasPrismicModuleRegistered) {
		config.modules ||= [];
		config.modules.push(NUXT_PRISMIC);
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
		config.prismic ||= {};
		config.prismic.endpoint = builders.raw("apiEndpoint || repositoryName");
	}

	await writeFile(mod, nuxtConfigPath);
};

const moveOrDeleteAppVue = async ({
	helpers,
	options,
}: PluginSystemContext<PluginOptions>) => {
	const filenameAppVue = await buildSrcPath({ filename: "app.vue", helpers });

	// If there's no `app.vue`, there's nothing to do.
	if (!(await checkHasProjectFile({ filename: filenameAppVue, helpers }))) {
		return;
	}

	const filecontentAppVue = await readProjectFile({
		filename: filenameAppVue,
		helpers,
		encoding: "utf-8",
	});

	// We check for app.vue to contain Nuxt default welcome component to determine
	// if we need to consider it as the default one or not.
	if (!filecontentAppVue.includes("<NuxtWelcome")) {
		return;
	}

	const filenameIndexVue = await buildSrcPath({
		filename: path.join("pages/index.vue"),
		helpers,
	});

	// If we don't have an `index.vue` we create one with the content of `app.vue`
	if (!(await checkHasProjectFile({ filename: filenameIndexVue, helpers }))) {
		await writeProjectFile({
			filename: filenameIndexVue,
			contents: filecontentAppVue,
			format: options.format,
			helpers,
		});
	}

	// Delete `app.vue`
	await deleteProjectFile({
		filename: filenameAppVue,
		helpers,
	});
};

const modifyPrismicConfig = async ({
	helpers,
	options,
	actions,
}: PluginSystemContext<PluginOptions>) => {
	const hasAppDirectory = await checkHasProjectFile({
		filename: "app",
		helpers,
	});
	const hasSrcDirectory = await checkHasProjectFile({
		filename: "src",
		helpers,
	});
	const project = await helpers.getProject();

	// Nest the default Slice Library in the `app` or `src` directory if it
	// exists and is empty.
	if (
		(hasAppDirectory || hasSrcDirectory) &&
		project.config.libraries &&
		JSON.stringify(project.config.libraries) === JSON.stringify(["./slices"])
	) {
		const sliceLibrary = await actions.readSliceLibrary({
			libraryID: project.config.libraries[0],
		});

		if (sliceLibrary.sliceIDs.length < 1) {
			project.config.libraries = hasAppDirectory
				? ["./app/slices"]
				: ["./src/slices"];
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
			moveOrDeleteAppVue(context),
			modifyPrismicConfig(context),
		]),
	);
};
