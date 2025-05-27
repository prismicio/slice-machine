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
import { upsertSliceLibraryIndexFile } from "../lib/upsertSliceLibraryIndexFile";

import type { PluginOptions } from "../types";
import { PRISMIC_ENVIRONMENT_ENVIRONMENT_VARIABLE_NAME } from "../constants";

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

	let contents: string;

	if (isTypeScriptProject) {
		contents = source`
			import { createClient as baseCreateClient, type Route } from "@prismicio/client";
			import { type CreateClientConfig, enableAutoPreviews } from '@prismicio/svelte/kit';
			import sm from "../../slicemachine.config.json";

			/**
			 * The project's Prismic repository name.
			 */
			export const repositoryName =
				import${"."}meta${"."}env.${PRISMIC_ENVIRONMENT_ENVIRONMENT_VARIABLE_NAME} || sm.repositoryName;

			/**
			 * A list of Route Resolver objects that define how a document's \`url\` field is resolved.
			 *
			 * {@link https://prismic.io/docs/route-resolver}
			 */
			// TODO: Update the routes array to match your project's route structure.
			const routes: Route[] = [
				// Examples:
				// { type: "homepage", path: "/" },
				// { type: "page", path: "/:uid" },
			];

			/**
			 * Creates a Prismic client for the project's repository. The client is used to
			 * query content from the Prismic API.
			 *
			 * @param config - Configuration for the Prismic client.
			 */
			export const createClient = ({ cookies, ...config }: CreateClientConfig = {}) => {
				const client = baseCreateClient(repositoryName, {
					routes,
					...config,
				});

				enableAutoPreviews({ client, cookies });

				return client;
			};
		`;
	} else {
		contents = source`
			import { createClient as baseCreateClient } from "@prismicio/client";
			import { enableAutoPreviews } from '@prismicio/svelte/kit';
			import sm from "../../slicemachine.config.json";

			/**
			 * The project's Prismic repository name.
			 */
			export const repositoryName =
				import${"."}meta${"."}env.${PRISMIC_ENVIRONMENT_ENVIRONMENT_VARIABLE_NAME} || sm.repositoryName;

			/**
			 * A list of Route Resolver objects that define how a document's \`url\` field is resolved.
			 *
			 * {@link https://prismic.io/docs/route-resolver#route-resolver}
			 *
			 * @type {import("@prismicio/client").Route[]}
			 */
			// TODO: Update the routes array to match your project's route structure.
			const routes = [
				// Examples:
				// { type: "homepage", path: "/" },
				// { type: "page", path: "/:uid" },
			];

			/**
			 * Creates a Prismic client for the project's repository. The client is used to
			 * query content from the Prismic API.
			 *
			 * @param {import('@prismicio/svelte/kit').CreateClientConfig} config - Configuration for the Prismic client.
			 */
			export const createClient = ({ cookies, ...config } = {}) => {
				const client = prismic.createClient(repositoryName, {
					routes,
					...config,
				});

				enableAutoPreviews({ client, cookies });

				return client;
			};
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
			{#snippet children(slices)}
				<SliceZone {slices} {components} />
			{/snippet}
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

const createPreviewRouteMatcherFile = async ({
	helpers,
	options,
}: SliceMachineContext<PluginOptions>) => {
	const extension = await getJSFileExtension({ helpers, options });
	const filename = path.join(`src/params/preview.${extension}`);

	if (await checkHasProjectFile({ filename, helpers })) {
		return;
	}

	const contents = source`
		export function match(param) {
			return param === 'preview';
		}
	`;

	await writeProjectFile({
		filename,
		contents,
		format: options.format,
		helpers,
	});
};

const createPreviewAPIRoute = async ({
	helpers,
	options,
}: SliceMachineContext<PluginOptions>) => {
	const extension = await getJSFileExtension({ helpers, options });
	const filename = path.join(
		"src",
		"routes",
		"api",
		"preview",
		`+server.${extension}`,
	);

	if (await checkHasProjectFile({ filename, helpers })) {
		return;
	}

	const isTypeScriptProject = await checkIsTypeScriptProject({
		helpers,
		options,
	});

	let contents;
	if (isTypeScriptProject) {
		contents = source`
			import { redirectToPreviewURL } from '@prismicio/svelte/kit';
			import { createClient } from '$lib/prismicio';
			import type { RequestHandler } from "./types";

			export const GET: RequestHandler = ({ fetch, request, cookies }) => {
				const client = createClient({ fetch });

				return await redirectToPreviewURL({ client, request, cookies });
			}
		`;
	} else {
		contents = source`
			import { redirectToPreviewURL } from '@prismicio/svelte/kit';
			import { createClient } from '$lib/prismicio';

			/* @type {import("./types").RequestHandler} */
			export async function GET({ fetch, request, cookies }) {
				const client = createClient({ fetch });

				return await redirectToPreviewURL({ client, request, cookies });
			}
		`;
	}

	await writeProjectFile({
		filename,
		contents,
		format: options.format,
		helpers,
	});
};

const createPreviewRouteDirectory = async ({
	helpers,
	options,
}: SliceMachineContext<PluginOptions>) => {
	const filename = path.join(
		"src",
		"routes",
		"[[preview=preview]]",
		"README.md",
	);

	if (await checkHasProjectFile({ filename, helpers })) {
		return;
	}

	const contents = source`
		This directory adds support for optional \`/preview\` routes. Do not remove this directory.

		All routes within this directory will be served using the following URLs:

		- \`/example-route\` (prerendered)
		- \`/preview/example-route\` (server-rendered)

		See <https://prismic.io/docs/svelte-preview> for more information.
	`;

	await writeProjectFile({
		filename,
		contents,
		format: options.format,
		helpers,
	});
};

const createRootLayoutServerFile = async ({
	helpers,
	options,
}: SliceMachineContext<PluginOptions>) => {
	const extension = await getJSFileExtension({ helpers, options });
	const filename = path.join(`src/routes/+layout.server.${extension}`);

	if (await checkHasProjectFile({ filename, helpers })) {
		return;
	}

	const contents = source`
		export const prerender = "auto";
	`;

	await writeProjectFile({
		filename,
		contents,
		format: options.format,
		helpers,
	});
};

const createRootLayoutFile = async ({
	helpers,
	options,
}: SliceMachineContext<PluginOptions>) => {
	const filename = path.join("src", "routes", "+layout.svelte");

	if (await checkHasProjectFile({ filename, helpers })) {
		return;
	}

	const contents = source`
		<script>
			import { isFilled, asImageSrc } from '@prismicio/client';
			import { PrismicPreview } from '@prismicio/svelte/kit';
			import { page } from '$app/state';
			import { repositoryName } from '$lib/prismicio';
		</script>

		<svelte:head>
			<title>{page.data.page?.data.meta_title}</title>
			<meta property="og:title" content={page.data.page?.data.meta_title} />
			{#if isFilled.keyText(page.data.page?.data.meta_description)}
				<meta name="description" content={page.data.page.data.meta_description} />
				<meta property="og:description" content={page.data.page.data.meta_description} />
			{/if}
			{#if isFilled.image(page.data.page?.data.meta_image)}
				<meta property="og:image" content={asImageSrc(page.data.page.data.meta_image)} />
			{/if}
		</svelte:head>
		{@render children()}
		<PrismicPreview {repositoryName} />
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
		project.config.libraries.map(async (libraryID) => {
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
			createPreviewAPIRoute(context),
			createPreviewRouteDirectory(context),
			createPreviewRouteMatcherFile(context),
			createRootLayoutServerFile(context),
			createRootLayoutFile(context),
		]),
	);

	// This must happen after `modifySliceMachineConfig()` since the
	// location of the default Slice library may change.
	await upsertSliceLibraryIndexFiles(context);
};
