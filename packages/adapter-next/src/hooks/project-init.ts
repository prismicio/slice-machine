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

import { checkHasAppRouter } from "../lib/checkHasAppRouter";
import { checkHasSrcDirectory } from "../lib/checkHasSrcDirectory";
import { checkIsTypeScriptProject } from "../lib/checkIsTypeScriptProject";
import { getJSFileExtension } from "../lib/getJSFileExtension";
import { rejectIfNecessary } from "../lib/rejectIfNecessary";

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
	const filename = path.join(
		...[hasSrcDirectory ? "src" : undefined, `prismicio.${extension}`].filter(
			(segment): segment is NonNullable<typeof segment> => Boolean(segment),
		),
	);

	if (await checkHasProjectFile({ filename, helpers })) {
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
			export const repositoryName =
				process.env.${PRISMIC_ENVIRONMENT_ENVIRONMENT_VARIABLE_NAME} || config.repositoryName;

			/**
			 * A list of Route Resolver objects that define how a document's \`url\` field is resolved.
			 *
			 * {@link https://prismic.io/docs/route-resolver#route-resolver}
			 */
			// TODO: Update the routes array to match your project's route structure.
			const routes: prismic.ClientConfig["routes"] = [
				// Examples:
				// {
				// 	type: "homepage",
				// 	path: "/",
				// },
				// {
				// 	type: "page",
				// 	path: "/:uid",
				// },
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
			export const repositoryName =
				process.env.${PRISMIC_ENVIRONMENT_ENVIRONMENT_VARIABLE_NAME} || config.repositoryName;

			/**
			 * A list of Route Resolver objects that define how a document's \`url\` field is resolved.
			 *
			 * {@link https://prismic.io/docs/route-resolver#route-resolver}
			 *
			 * @type {prismic.ClientConfig["routes"]}
			 */
			// TODO: Update the routes array to match your project's route structure.
			const routes = [
				// Examples:
				// {
				// 	type: "homepage",
				// 	path: "/",
				// },
				// {
				// 	type: "page",
				// 	path: "/:uid",
				// },
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

type CreateSliceSimulatorPageArgs = SliceMachineContext<PluginOptions>;

const createSliceSimulatorPage = async ({
	helpers,
	options,
}: CreateSliceSimulatorPageArgs) => {
	const isTypeScriptProject = await checkIsTypeScriptProject({
		helpers,
		options,
	});
	const hasSrcDirectory = await checkHasSrcDirectory({ helpers });
	const hasAppRouter = await checkHasAppRouter({ helpers });

	const extension = await getJSFileExtension({ helpers, options, jsx: true });
	const filename = path.join(
		...[
			hasSrcDirectory ? "src" : undefined,
			hasAppRouter
				? `app/slice-simulator/page.${extension}`
				: `pages/slice-simulator.${extension}`,
		].filter((segment): segment is NonNullable<typeof segment> =>
			Boolean(segment),
		),
	);

	if (await checkHasProjectFile({ filename, helpers })) {
		return;
	}

	let contents;

	if (hasAppRouter) {
		if (isTypeScriptProject) {
			contents = source`
				import {
					SliceSimulator,
					SliceSimulatorParams,
					getSlices,
				} from "@slicemachine/adapter-next/simulator";
				import { SliceZone } from "@prismicio/react";

				import { components } from "../../slices";

				export default function SliceSimulatorPage({
					searchParams,
				}: SliceSimulatorParams) {
					const slices = getSlices(searchParams.state);

					return (
						<SliceSimulator>
							<SliceZone slices={slices} components={components} />
						</SliceSimulator>
					);
				}
			`;
		} else {
			contents = source`
				import {
					SliceSimulator,
					getSlices,
				} from "@slicemachine/adapter-next/simulator";
				import { SliceZone } from "@prismicio/react";

				import { components } from "../../slices";

				export default function SliceSimulatorPage({ searchParams }) {
					const slices = getSlices(searchParams.state);

					return (
						<SliceSimulator>
							<SliceZone slices={slices} components={components} />
						</SliceSimulator>
					);
				}
			`;
		}
	} else {
		contents = source`
			import { SliceSimulator } from "@slicemachine/adapter-next/simulator";
			import { SliceZone } from "@prismicio/react";

			import { components } from "../slices";

			export default function SliceSimulatorPage() {
				return (
					<SliceSimulator
						sliceZone={(props) => <SliceZone {...props} components={components} />}
					/>
				);
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
	const filename = path.join(
		...[
			hasSrcDirectory ? "src" : undefined,
			hasAppRouter
				? `app/api/preview/route.${extension}`
				: `pages/api/preview.${extension}`,
		].filter((segment): segment is NonNullable<typeof segment> =>
			Boolean(segment),
		),
	);

	if (await checkHasProjectFile({ filename, helpers })) {
		return;
	}

	let contents: string;

	if (hasAppRouter) {
		if (isTypeScriptProject) {
			contents = source`
				import { NextRequest } from "next/server";
				import { redirectToPreviewURL } from "@prismicio/next";

				import { createClient } from "../../../prismicio";

				export async function GET(request: NextRequest) {
					const client = createClient();

					return await redirectToPreviewURL({ client, request });
				}
			`;
		} else {
			contents = source`
				import { redirectToPreviewURL } from "@prismicio/next";

				import { createClient } from "../../../prismicio";

				export async function GET(request) {
					const client = createClient();

					return await redirectToPreviewURL({ client, request });
				}
			`;
		}
	} else {
		if (isTypeScriptProject) {
			contents = source`
				import { NextApiRequest, NextApiResponse } from "next";
				import { setPreviewData, redirectToPreviewURL } from "@prismicio/next";

				import { createClient } from "../../prismicio";

				export default async function handler(req: NextApiRequest, res: NextApiResponse) {
					const client = createClient({ req });

					await setPreviewData({ req, res });

					return await redirectToPreviewURL({ req, res, client });
				};
			`;
		} else {
			contents = source`
				import { setPreviewData, redirectToPreviewURL } from "@prismicio/next";

				import { createClient } from "../../prismicio";

				export default async function handler(req, res) {
					const client = createClient({ req });

					await setPreviewData({ req, res });

					return await redirectToPreviewURL({ req, res, client });
				};
			`;
		}
	}

	await writeProjectFile({
		filename,
		contents,
		format: options.format,
		helpers,
	});
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
	const filename = path.join(
		...[
			hasSrcDirectory ? "src" : undefined,
			hasAppRouter
				? `app/api/exit-preview/route.${extension}`
				: `pages/api/exit-preview.${extension}`,
		].filter((segment): segment is NonNullable<typeof segment> =>
			Boolean(segment),
		),
	);

	if (await checkHasProjectFile({ filename, helpers })) {
		return;
	}

	let contents: string;

	if (hasAppRouter) {
		contents = source`
			import { exitPreview } from "@prismicio/next";

			export function GET() {
				return exitPreview();
			}
		`;
	} else {
		if (isTypeScriptProject) {
			contents = source`
				import { NextApiRequest, NextApiResponse } from "next";
				import { exitPreview } from "@prismicio/next";

				export default function handler(req: NextApiRequest, res: NextApiResponse) {
					return exitPreview({ req, res });
				}
			`;
		} else {
			contents = source`
				import { exitPreview } from "@prismicio/next";

				export default function handler(req, res) {
					return exitPreview({ req, res });
				}
			`;
		}
	}

	await writeProjectFile({
		filename,
		contents,
		format: options.format,
		helpers,
	});
};

const modifySliceMachineConfig = async ({
	helpers,
	options,
	actions,
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
	const filename = path.join(
		...[
			hasSrcDirectory ? "src" : undefined,
			`app/api/revalidate/route.${extension}`,
		].filter((segment): segment is NonNullable<typeof segment> =>
			Boolean(segment),
		),
	);

	if (await checkHasProjectFile({ filename, helpers })) {
		return;
	}

	const contents = source`
		import { NextResponse } from "next/server";
		import { revalidateTag } from "next/cache";

		export async function POST() {
			revalidateTag("prismic");

			return NextResponse.json({ revalidated: true, now: Date.now() });
		}
	`;

	await writeProjectFile({
		filename,
		contents,
		format: options.format,
		helpers,
	});
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
