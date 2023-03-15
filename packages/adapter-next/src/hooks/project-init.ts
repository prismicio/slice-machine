import * as fs from "node:fs/promises";
import * as path from "node:path";
import type {
	ProjectInitHook,
	ProjectInitHookData,
	SliceMachineContext,
} from "@slicemachine/plugin-kit";
import { stripIndent } from "common-tags";

import { checkPathExists } from "../lib/checkPathExists";
import { getJSOrTSXFileExtension } from "../lib/getJSOrTSXFileExtension";
import { rejectIfNecessary } from "../lib/rejectIfNecessary";

import type { PluginOptions } from "../types";
import { checkIsTypeScriptProject } from "../lib/checkIsTypeScriptProject";

type InstallDependenciesArgs = {
	installDependencies: ProjectInitHookData["installDependencies"];
};

const installDependencies = async ({
	installDependencies,
}: InstallDependenciesArgs) => {
	await installDependencies({
		dependencies: {
			"@prismicio/client": "latest",
			"@prismicio/helpers": "latest",
			"@prismicio/react": "latest",
			"@prismicio/next": "latest",
		},
	});

	await installDependencies({
		dependencies: {
			"@prismicio/types": "latest",
		},
		dev: true,
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

	const filePath = helpers.joinPathFromRoot(
		isTypeScriptProject ? "prismicio.ts" : "prismicio.js",
	);

	if (await checkPathExists(filePath)) {
		return;
	}

	let contents: string;

	if (isTypeScriptProject) {
		contents = stripIndent`
			import * as prismic from "@prismicio/client";
			import * as prismicNext from "@prismicio/next";
			import config from "./slicemachine.config.json";

			/**
			 * The project's Prismic repository name.
			 */
			export const repositoryName = config.repositoryName;

			/**
			 * A list of Route Resolver objects that define how a document's \`url\` field
			 * is resolved.
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

			/**
			 * Creates a Prismic client for the project's repository. The client is used to
			 * query content from the Prismic API.
			 *
			 * @param config - Configuration for the Prismic client.
			 */
			export const createClient = (config: prismicNext.CreateClientConfig = {}) => {
				const client = prismic.createClient(repositoryName, {
					routes,
					...config,
				});

				prismicNext.enableAutoPreviews({
					client,
					previewData: config.previewData,
					req: config.req,
				});

				return client;
			};
		`;
	} else {
		contents = stripIndent`
			import * as prismic from "@prismicio/client";
			import * as prismicNext from "@prismicio/next";
			import config from "./slicemachine.config.json";

			/**
			 * The project's Prismic repository name.
			 */
			export const repositoryName = config.repositoryName;

			/**
			 * A list of Route Resolver objects that define how a document's \`url\` field
			 * is resolved.
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

			/**
			 * Creates a Prismic client for the project's repository. The client is used to
			 * query content from the Prismic API.
			 *
			 * @param {prismicNext.CreateClientConfig} config - Configuration for the Prismic client.
			 */
			export const createClient = (config = {}) => {
				const client = prismic.createClient(repositoryName, {
					routes,
					...config,
				});

				prismicNext.enableAutoPreviews({
					client,
					previewData: config.previewData,
					req: config.req,
				});

				return client;
			};
		`;
	}

	if (options.format) {
		contents = await helpers.format(contents, filePath);
	}

	await fs.writeFile(filePath, contents);
};

type CreateSliceSimulatorPageArgs = SliceMachineContext<PluginOptions>;

const createSliceSimulatorPage = async ({
	helpers,
	options,
}: CreateSliceSimulatorPageArgs) => {
	const srcDirectoryExists = await checkPathExists(
		helpers.joinPathFromRoot("src"),
	);

	const filePath = helpers.joinPathFromRoot(
		srcDirectoryExists ? "src/pages" : "pages",
		`slice-simulator.${await getJSOrTSXFileExtension({ helpers, options })}`,
	);

	if (await checkPathExists(filePath)) {
		return;
	}

	await fs.mkdir(path.dirname(filePath), { recursive: true });

	let contents = stripIndent`
		import { SliceSimulator } from "@slicemachine/adapter-next/simulator";
		import { SliceZone } from "@prismicio/react";

		import { components } from "../slices";

		const SliceSimulatorPage = () => {
			return (
				<SliceSimulator
					sliceZone={(props) => <SliceZone {...props} components={components} />}
				/>
			);
		};

		export default SliceSimulatorPage;
	`;

	if (options.format) {
		contents = await helpers.format(contents, filePath);
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
			await createPrismicIOFile(context),
			await createSliceSimulatorPage(context),
		]),
	);
};
