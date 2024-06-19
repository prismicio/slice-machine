import * as path from "node:path";
import type {
	ProjectInitHook,
	ProjectInitHookData,
	SliceMachineContext,
} from "@slicemachine/plugin-kit";
import {
	checkHasProjectFile,
	deleteProjectFile,
	readProjectFile,
	writeProjectFile,
} from "@slicemachine/plugin-kit/fs";
import { stripIndent } from "common-tags";
import { builders, loadFile, writeFile } from "magicast";

import { buildSrcPath } from "../lib/buildSrcPath";
import { rejectIfNecessary } from "../lib/rejectIfNecessary";
import { checkIsTypeScriptProject } from "../lib/checkIsTypeScriptProject";

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
			[NUXT_PRISMIC]: "^3.3.0",
		},
		dev: true,
	});
};

type ConfigurePrismicModuleArgs = SliceMachineContext<PluginOptions>;

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
		// Import Slice Machine configuration
		mod.imports.$add({
			from: "./slicemachine.config.json",
			imported: "apiEndpoint",
		});
		mod.imports.$add({
			from: "./slicemachine.config.json",
			imported: "repositoryName",
		});

		// Add inline configuration
		config.prismic ||= {};
		config.prismic.endpoint = builders.raw("apiEndpoint || repositoryName");
	}

	await writeFile(mod, nuxtConfigPath);
};

type CreateSliceSimulatorPageArgs = SliceMachineContext<PluginOptions>;

const createSliceSimulatorPage = async ({
	helpers,
	options,
}: CreateSliceSimulatorPageArgs) => {
	const isTypeScriptProject = await checkIsTypeScriptProject({
		helpers,
		options,
	});

	const appPagesDirectoryExists = await checkHasProjectFile({
		filename: "app/pages",
		helpers,
	});

	const srcPagesDirectoryExists = await checkHasProjectFile({
		filename: "src/pages",
		helpers,
	});

	const pagesDirectoryExists = await checkHasProjectFile({
		filename: "pages",
		helpers,
	});

	let filename: string;
	// We first give priority to existing `pages` directory, then to `srcDir`
	// because there could be conflicts with legacy `app` directory.
	if (appPagesDirectoryExists) {
		filename = path.join("app/pages", "slice-simulator.vue");
	} else if (srcPagesDirectoryExists) {
		filename = path.join("src/pages", "slice-simulator.vue");
	} else if (pagesDirectoryExists) {
		filename = path.join("pages", "slice-simulator.vue");
	} else {
		filename = await buildSrcPath({
			filename: path.join("pages", "slice-simulator.vue"),
			helpers,
		});
	}

	if (await checkHasProjectFile({ filename, helpers })) {
		return;
	}

	const scriptAttributes = ["setup"];
	if (isTypeScriptProject) {
		scriptAttributes.push('lang="ts"');
	}

	const contents = stripIndent`
		<template>
			<SliceSimulator #default="{ slices }">
				<SliceZone :slices="slices" :components="components" />
			</SliceSimulator>
		</template>

		<script ${scriptAttributes.join(" ")}>
		import { SliceSimulator } from "@slicemachine/adapter-nuxt/simulator";
		import { components } from "~/slices";
		</script>
	`;

	await writeProjectFile({
		filename,
		contents,
		format: options.format,
		helpers,
	});
};

const moveOrDeleteAppVue = async ({
	helpers,
	options,
}: CreateSliceSimulatorPageArgs) => {
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

const modifySliceMachineConfig = async ({
	helpers,
	options,
	actions,
}: SliceMachineContext<PluginOptions>) => {
	const hasAppDirectory = await checkHasProjectFile({
		filename: "app",
		helpers,
	});
	const hasSrcDirectory = await checkHasProjectFile({
		filename: "src",
		helpers,
	});
	const project = await helpers.getProject();

	// Add Slice Simulator URL.
	project.config.localSliceSimulatorURL ||=
		"http://localhost:3000/slice-simulator";

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

	await helpers.updateSliceMachineConfig(project.config, {
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
			createSliceSimulatorPage(context),
			moveOrDeleteAppVue(context),
			modifySliceMachineConfig(context),
		]),
	);
};
