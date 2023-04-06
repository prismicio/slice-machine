import * as fs from "node:fs/promises";
import * as path from "node:path";
import type {
	ProjectInitHook,
	ProjectInitHookData,
	SliceMachineContext,
} from "@slicemachine/plugin-kit";
import { stripIndent } from "common-tags";
import { loadFile, writeFile, type ASTNode } from "magicast";

import { checkPathExists } from "../lib/checkPathExists";
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

type ConfigurePrismicModuleArgs = SliceMachineContext<PluginOptions>;

const configurePrismicModule = async ({
	helpers,
	project,
}: ConfigurePrismicModuleArgs) => {
	let nuxtConfigPath = helpers.joinPathFromRoot("nuxt.config.js");

	if (!(await checkPathExists(nuxtConfigPath))) {
		nuxtConfigPath = helpers.joinPathFromRoot("nuxt.config.ts");

		// nuxt.config.* not found
		if (!(await checkPathExists(nuxtConfigPath))) {
			return;
		}
	}

	const mod = await loadFile(nuxtConfigPath);
	const config =
		mod.exports.default.$type === "function-call"
			? mod.exports.default.$args[0]
			: mod.exports.default;

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
	const endpoint =
		project.config.apiEndpoint ||
		`https://${project.config.repositoryName}.cdn.prismic.io/api/v2`;
	if (!hasInlinedConfiguration) {
		if (config.prismic) {
			config.prismic.endpoint = endpoint;
		} else {
			config.prismic = {
				endpoint,
				modern: true,
			};
		}
	}

	// Transpile `@prismicio/vue`
	config.build ||= {};
	config.build.transpile ||= [];
	config.build.transpile.push("@prismicio/vue");

	await writeFile(mod as unknown as ASTNode, nuxtConfigPath);
};

type CreateSliceSimulatorPageArgs = SliceMachineContext<PluginOptions>;

const createSliceSimulatorPage = async ({
	helpers,
	options,
}: CreateSliceSimulatorPageArgs) => {
	const srcPagesDirectoryExists = await checkPathExists(
		helpers.joinPathFromRoot("src/pages"),
	);

	const filePath = helpers.joinPathFromRoot(
		srcPagesDirectoryExists ? "src/pages" : "pages",
		"slice-simulator.vue",
	);

	if (await checkPathExists(filePath)) {
		return;
	}

	await fs.mkdir(path.dirname(filePath), { recursive: true });

	let contents = stripIndent`
		<template>
			<SliceSimulator v-slot="{ slices }">
				<SliceZone :slices="slices" :components="components" />
			</SliceSimulator>
		</template>

		<script>
		import { SliceSimulator } from "@slicemachine/adapter-nuxt2/simulator";
		import { components } from "~/slices";

		export default {
			components: {
				SliceSimulator,
			},
			data () {
				return { components };
			},
		};
		</script>
	`;

	if (options.format) {
		contents = await helpers.format(contents, filePath, {
			prettier: { parser: "vue" },
		});
	}

	await fs.writeFile(filePath, contents);
};

export const projectInit: ProjectInitHook<PluginOptions> = async (
	{ installDependencies: _installDependencies },
	context,
) => {
	rejectIfNecessary(
		await Promise.allSettled([
			await installDependencies({ installDependencies: _installDependencies }),
			await configurePrismicModule(context),
			await createSliceSimulatorPage(context),
		]),
	);
};
