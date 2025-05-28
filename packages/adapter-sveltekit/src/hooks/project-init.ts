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
import { getSvelteMajor } from "../lib/getSvelteMajor";
import { rejectIfNecessary } from "../lib/rejectIfNecessary";
import { upsertSliceLibraryIndexFile } from "../lib/upsertSliceLibraryIndexFile";

import type { PluginOptions } from "../types";
import {
	previewAPIRouteTemplate,
	prismicIOFileTemplate,
	rootLayoutTemplate,
	sliceSimulatorPageTemplate,
} from "./project-init.templates";

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
	const extension = await getJSFileExtension({ helpers, options });
	const filename = path.join(`src/lib/prismicio.${extension}`);

	if (await checkHasProjectFile({ filename, helpers })) {
		return;
	}

	const typescript = await checkIsTypeScriptProject({ helpers, options });
	const contents = prismicIOFileTemplate({ typescript });

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

	const contents = sliceSimulatorPageTemplate({
		version: await getSvelteMajor(),
	});

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

	const typescript = await checkIsTypeScriptProject({ helpers, options });
	const contents = previewAPIRouteTemplate({ typescript });

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

	const contents = rootLayoutTemplate({ version: await getSvelteMajor() });

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
