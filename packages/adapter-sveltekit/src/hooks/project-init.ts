import * as path from "node:path";
import type {
	ProjectInitHook,
	ProjectInitHookData,
	SliceMachineContext,
} from "@slicemachine/plugin-kit";
import {
	checkHasProjectFile,
	writeProjectFile,
} from "@slicemachine/plugin-kit/fs";
import { source } from "common-tags";

import { checkIsTypeScriptProject } from "../lib/checkIsTypeScriptProject";
import { getJSFileExtension } from "../lib/getJSFileExtension";
import { rejectIfNecessary } from "../lib/rejectIfNecessary";

import type { PluginOptions } from "../types";
import { upsertSliceLibraryIndexFile } from "../lib/upsertSliceLibraryIndexFile";

type InstallDependenciesArgs = {
	installDependencies: ProjectInitHookData["installDependencies"];
};

const installDependencies = async ({
	installDependencies,
}: InstallDependenciesArgs) => {
	await installDependencies({
		dependencies: {
			"@prismicio/client": "latest",
			"@prismicio/svelte": "latest",
		},
	});
};

type CreatePrismicIOFileArgs = SliceMachineContext<PluginOptions>;

const createPrismicIOFile = async ({
	helpers,
	options,
}: CreatePrismicIOFileArgs) => {
	const isTypeScriptProject = await checkIsTypeScriptProject({
		helpers,
		options,
	});
	const extension = await getJSFileExtension({ helpers, options });
	const filename = path.join(`src/lib/prismicio.${extension}`);

	if (await checkHasProjectFile({ filename, helpers })) {
		return;
	}

	let createClientContents: string;

	if (isTypeScriptProject) {
		createClientContents = source`
			/**
			 * Creates a Prismic client for the project's repository. The client is used to
			 * query content from the Prismic API.
			 *
			 * @param config - Configuration for the Prismic client.
			 */
			export const createClient = (config: prismic.ClientConfig = {}) => {
				const client = prismic.createClient(repositoryName, {
					routes,
					...config,
				});

				return client;
			};
		`;
	} else {
		createClientContents = source`
			/**
			 * Creates a Prismic client for the project's repository. The client is used to
			 * query content from the Prismic API.
			 *
			 * @param {prismic.ClientConfig} config - Configuration for the Prismic client.
			 */
			export const createClient = (config = {}) => {
				const client = prismic.createClient(repositoryName, {
					routes,
					...config,
				});

				return client;
			};
		`;
	}

	let contents: string;

	if (isTypeScriptProject) {
		contents = source`
			import * as prismic from "@prismicio/client";
			import config from "../../slicemachine.config.json";

			/**
			 * The project's Prismic repository name.
			 */
			export const repositoryName = config.repositoryName;

			/**
			 * A list of Route Resolver objects that define how a document's \`url\` field is resolved.
			 *
			 * {@link https://prismic.io/docs/route-resolver#route-resolver}
			 */
			// TODO: Update the routes array to match your project's route structure.
			const routes: prismic.ClientConfig["routes"] = [
				{
					type: "homepage",
					path: "/",
				},
				{
					type: "page",
					path: "/:uid",
				},
			];

			${createClientContents}
		`;
	} else {
		contents = source`
			import * as prismic from "@prismicio/client";
			import config from "../../slicemachine.config.json";

			/**
			 * The project's Prismic repository name.
			 */
			export const repositoryName = config.repositoryName;

			/**
			 * A list of Route Resolver objects that define how a document's \`url\` field is resolved.
			 *
			 * {@link https://prismic.io/docs/route-resolver#route-resolver}
			 *
			 * @type {prismic.ClientConfig["routes"]}
			 */
			// TODO: Update the routes array to match your project's route structure.
			const routes = [
				{
					type: "homepage",
					path: "/",
				},
				{
					type: "page",
					path: "/:uid",
				},
			];

			${createClientContents}
		`;
	}

	await writeProjectFile({
		filename,
		contents,
		format: options.format,
		helpers,
	});
};

const createSliceSimulatorPage = async ({
	helpers,
	options,
}: SliceMachineContext<PluginOptions>) => {
	const filename = path.join(
		"src",
		"routes",
		"slice-simulator",
		"+page.svelte",
	);

	if (await checkHasProjectFile({ filename, helpers })) {
		return;
	}

	const contents = source`
		<script>
			import { SliceSimulator } from '@slicemachine/adapter-sveltekit/simulator';
			import { SliceZone } from '@prismicio/svelte';
			import { components } from '$lib/slices';
		</script>

		<SliceSimulator let:slices>
			<SliceZone {slices} {components} />
		</SliceSimulator>
	`;

	await writeProjectFile({
		filename,
		contents,
		format: options.format,
		formatOptions: {
			prettier: {
				plugins: ["prettier-plugin-svelte"],
				parser: "svelte",
			},
		},
		helpers,
	});
};

const modifySliceMachineConfig = async ({
	helpers,
	options,
	actions,
}: SliceMachineContext<PluginOptions>) => {
	const project = await helpers.getProject();

	// Add Slice Simulator URL.
	project.config.localSliceSimulatorURL ||=
		"http://localhost:5173/slice-simulator";

	// Nest the default Slice Library in the src directory if it exists and
	// is empty.
	if (
		(await checkHasProjectFile({
			filename: "./src/lib",
			helpers,
		})) &&
		project.config.libraries &&
		JSON.stringify(project.config.libraries) === JSON.stringify(["./slices"])
	) {
		const sliceLibrary = await actions.readSliceLibrary({
			libraryID: project.config.libraries[0],
		});

		if (sliceLibrary.sliceIDs.length < 1) {
			project.config.libraries = ["./src/lib/slices"];
		}
	}

	await helpers.updateSliceMachineConfig(project.config, {
		format: options.format,
	});
};

const upsertSliceLibraryIndexFiles = async (
	context: SliceMachineContext<PluginOptions>,
) => {
	// We must use the `getProject()` helper to get the latest version of
	// the project config. The config may have been modified in
	// `modifySliceMachineConfig()` and will not be relfected in
	// `context.project`.
	// TODO: Automatically update the plugin runner's in-memory `project`
	// object when `updateSliceMachineConfig()` is called.
	const project = await context.helpers.getProject();

	if (!project.config.libraries) {
		return;
	}

	await Promise.all(
		project.config.libraries?.map(async (libraryID) => {
			await upsertSliceLibraryIndexFile({ libraryID, ...context });
		}),
	);
};

export const projectInit: ProjectInitHook<PluginOptions> = async (
	{ installDependencies: _installDependencies },
	context,
) => {
	rejectIfNecessary(
		await Promise.allSettled([
			installDependencies({ installDependencies: _installDependencies }),
			modifySliceMachineConfig(context),
			createPrismicIOFile(context),
			createSliceSimulatorPage(context),
		]),
	);

	// This must happen after `modifySliceMachineConfig()` since the
	// location of the default Slice library may change.
	await upsertSliceLibraryIndexFiles(context);
};
