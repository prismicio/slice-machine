import * as fs from "node:fs/promises";
import * as path from "node:path";
import type {
	ProjectInitHook,
	ProjectInitHookData,
	SliceMachineContext,
} from "@slicemachine/plugin-kit";
import { source } from "common-tags";

import { checkHasAppRouter } from "../lib/checkHasAppRouter";
import { checkHasSrcDirectory } from "../lib/checkHasSrcDirectory";
import { checkIsTypeScriptProject } from "../lib/checkIsTypeScriptProject";
import { checkPathExists } from "../lib/checkPathExists";
import { getJSFileExtension } from "../lib/getJSFileExtension";
import { rejectIfNecessary } from "../lib/rejectIfNecessary";

import type { PluginOptions } from "../types";

type InstallDependenciesArgs = {
	installDependencies: ProjectInitHookData["installDependencies"];
};

const installDependencies = async ({
	installDependencies,
}: InstallDependenciesArgs) => {
	await installDependencies({
		dependencies: {
			"@prismicio/client": "latest",
			"@prismicio/react": "latest",
			"@prismicio/next": "latest",
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
	const hasSrcDirectory = await checkHasSrcDirectory({ helpers });
	const hasAppRouter = await checkHasAppRouter({ helpers });

	const extension = await getJSFileExtension({ helpers, options });
	const filename = `prismicio.${extension}`;
	const filePath = hasSrcDirectory
		? helpers.joinPathFromRoot("src", filename)
		: helpers.joinPathFromRoot(filename);

	if (await checkPathExists(filePath)) {
		return;
	}

	let createClientContents: string;

	if (hasAppRouter) {
		if (isTypeScriptProject) {
			createClientContents = source`
				/**
				 * Creates a Prismic client for the project's repository. The client is used to
				 * query content from the Prismic API.
				 *
				 * @param config - Configuration for the Prismic client.
				 */
				export const createClient = (config: prismicNext.CreateClientConfig = {}) => {
					const client = prismic.createClient(repositoryName, {
						routes,
						fetchOptions:
							process.env.NODE_ENV === 'production'
								? { next: { tags: ['prismic'] }, cache: 'force-cache' }
								: { next: { revalidate: 5 } },
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
			createClientContents = source`
				/**
				 * Creates a Prismic client for the project's repository. The client is used to
				 * query content from the Prismic API.
				 *
				 * @param {prismicNext.CreateClientConfig} config - Configuration for the Prismic client.
				 */
				export const createClient = (config = {}) => {
					const client = prismic.createClient(repositoryName, {
						routes,
						fetchOptions:
							process.env.NODE_ENV === 'production'
								? { next: { tags: ['prismic'] }, cache: 'force-cache' }
								: { next: { revalidate: 5 } },
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
	} else {
		if (isTypeScriptProject) {
			createClientContents = source`
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
			createClientContents = source`
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
	}

	let contents: string;

	if (isTypeScriptProject) {
		contents = source`
			import * as prismic from "@prismicio/client";
			import * as prismicNext from "@prismicio/next";
			import config from "${hasSrcDirectory ? ".." : "."}/slicemachine.config.json";

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
			import * as prismicNext from "@prismicio/next";
			import config from "${hasSrcDirectory ? ".." : "."}/slicemachine.config.json";

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
	const hasSrcDirectory = await checkHasSrcDirectory({ helpers });
	const hasAppRouter = await checkHasAppRouter({ helpers });

	const extension = await getJSFileExtension({ helpers, options, jsx: true });
	const filePath = helpers.joinPathFromRoot(
		...[
			hasSrcDirectory ? "src" : undefined,
			hasAppRouter
				? `app/slice-simulator/page.${extension}`
				: `pages/slice-simulator.${extension}`,
		].filter((segment): segment is NonNullable<typeof segment> =>
			Boolean(segment),
		),
	);

	if (await checkPathExists(filePath)) {
		return;
	}

	await fs.mkdir(path.dirname(filePath), { recursive: true });

	let contents = source`
		"use client"

		import { SliceSimulator } from "@slicemachine/adapter-next/simulator";
		import { SliceZone } from "@prismicio/react";

		import { components } from "${hasAppRouter ? "../.." : ".."}/slices";

		export default function SliceSimulatorPage() {
			return (
				<SliceSimulator
					sliceZone={(props) => <SliceZone {...props} components={components} />}
				/>
			);
		}
	`;

	if (options.format) {
		contents = await helpers.format(contents, filePath);
	}

	await fs.writeFile(filePath, contents);
};

const createPreviewRoute = async ({
	helpers,
	options,
}: SliceMachineContext<PluginOptions>) => {
	const hasSrcDirectory = await checkHasSrcDirectory({ helpers });
	const hasAppRouter = await checkHasAppRouter({ helpers });
	const isTypeScriptProject = await checkIsTypeScriptProject({
		helpers,
		options,
	});

	const extension = await getJSFileExtension({ helpers, options });
	const filePath = helpers.joinPathFromRoot(
		...[
			hasSrcDirectory ? "src" : undefined,
			hasAppRouter
				? `app/api/preview/route.${extension}`
				: `pages/api/preview.${extension}`,
		].filter((segment): segment is NonNullable<typeof segment> =>
			Boolean(segment),
		),
	);

	if (await checkPathExists(filePath)) {
		return;
	}

	let contents: string;

	if (hasAppRouter) {
		if (isTypeScriptProject) {
			contents = source`
				import { NextRequest } from "next/server";
				import { draftMode } from "next/headers";
				import { redirectToPreviewURL } from "@prismicio/next";

				import { createClient } from "../../../prismicio";

				export async function GET(request: NextRequest) {
					const client = createClient();

					draftMode().enable();

					await redirectToPreviewURL({ client, request });
				}
			`;
		} else {
			contents = source`
				import { draftMode } from "next/headers";
				import { redirectToPreviewURL } from "@prismicio/next";

				import { createClient } from "../../../prismicio";

				export async function GET(request) {
					const client = createClient();

					draftMode().enable();

					await redirectToPreviewURL({ client, request });
				}
			`;
		}
	} else {
		if (isTypeScriptProject) {
			contents = source`
				import { NextApiRequest, NextApiResponse } from "next";
				import { setPreviewData, redirectToPreviewURL } from "@prismicio/next";

				import { createClient } from "../../prismicio";

				export default async (req: NextApiRequest, res: NextApiResponse) => {
					const client = createClient({ req });

					await setPreviewData({ req, res });

					await redirectToPreviewURL({ req, res, client });
				};
			`;
		} else {
			contents = source`
				import { setPreviewData, redirectToPreviewURL } from "@prismicio/next";

				import { createClient } from "../../prismicio";

				export default async (req, res) => {
					const client = createClient({ req });

					await setPreviewData({ req, res });

					await redirectToPreviewURL({ req, res, client });
				};
			`;
		}
	}

	if (options.format) {
		contents = await helpers.format(contents, filePath);
	}

	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await fs.writeFile(filePath, contents);
};

const createExitPreviewRoute = async ({
	helpers,
	options,
}: SliceMachineContext<PluginOptions>) => {
	const hasSrcDirectory = await checkHasSrcDirectory({ helpers });
	const hasAppRouter = await checkHasAppRouter({ helpers });
	const isTypeScriptProject = await checkIsTypeScriptProject({
		helpers,
		options,
	});

	const extension = await getJSFileExtension({ helpers, options });
	const filePath = helpers.joinPathFromRoot(
		...[
			hasSrcDirectory ? "src" : undefined,
			hasAppRouter
				? `app/api/exit-preview/route.${extension}`
				: `pages/api/exit-preview.${extension}`,
		].filter((segment): segment is NonNullable<typeof segment> =>
			Boolean(segment),
		),
	);

	if (await checkPathExists(filePath)) {
		return;
	}

	let contents: string;

	if (hasAppRouter) {
		contents = `
			import { exitPreview } from "@prismicio/next";

			export async function GET() {
				return await exitPreview();
			}
		`;
	} else {
		if (isTypeScriptProject) {
			contents = source`
				import { NextApiRequest, NextApiResponse } from "next";
				import { exitPreview } from "@prismicio/next";

				export async function handler(req: NextApiRequest, res: NextApiResponse) {
					return await exitPreview({ req, res });
				}
			`;
		} else {
			contents = source`
				import { exitPreview } from "@prismicio/next";

				export async function handler(req, res) {
					return await exitPreview({ req, res });
				}
			`;
		}
	}

	if (options.format) {
		contents = await helpers.format(contents, filePath);
	}

	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await fs.writeFile(filePath, contents);
};

const modifySliceMachineConfig = async ({
	helpers,
	options,
}: SliceMachineContext<PluginOptions>) => {
	const hasSrcDirectory = await checkHasSrcDirectory({ helpers });
	const project = await helpers.getProject();

	// Add Slice Simulator URL.
	project.config.localSliceSimulatorURL ||=
		"http://localhost:3000/slice-simulator";

	// Nest the default Slice Library in the src directory if it exists and
	// is empty.
	if (
		hasSrcDirectory &&
		JSON.stringify(project.config.libraries) === JSON.stringify(["./slices"])
	) {
		try {
			const entries = await fs.readdir(helpers.joinPathFromRoot("slices"));

			if (!entries.map((entry) => path.parse(entry).name).includes("index")) {
				project.config.libraries = ["./src/slices"];
			}
		} catch (error) {
			if (
				error instanceof Error &&
				"code" in error &&
				error.code === "ENOENT"
			) {
				// The directory does not exist, which means we
				// can safely nest the library.
				project.config.libraries = ["./src/slices"];
			}
		}
	}

	await helpers.updateSliceMachineConfig(project.config, {
		format: options.format,
	});
};

const createRevalidateRoute = async ({
	helpers,
	options,
}: SliceMachineContext<PluginOptions>) => {
	const hasAppRouter = await checkHasAppRouter({ helpers });

	if (!hasAppRouter) {
		return;
	}

	const hasSrcDirectory = await checkHasSrcDirectory({ helpers });

	const extension = await getJSFileExtension({ helpers, options });
	const filePath = helpers.joinPathFromRoot(
		...[
			hasSrcDirectory ? "src" : undefined,
			`app/api/revalidate/route.${extension}`,
		].filter((segment): segment is NonNullable<typeof segment> =>
			Boolean(segment),
		),
	);

	if (await checkPathExists(filePath)) {
		return;
	}

	let contents = source`
		import { NextResponse } from "next/server";
		import { revalidateTag } from "next/cache";

		export async function POST() {
			revalidateTag("prismic");

			return NextResponse.json({ revalidated: true, now: Date.now() });
		}
	`;

	if (options.format) {
		contents = await helpers.format(contents, filePath);
	}

	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await fs.writeFile(filePath, contents);
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
			createPreviewRoute(context),
			createExitPreviewRoute(context),
			createRevalidateRoute(context),
		]),
	);
};
