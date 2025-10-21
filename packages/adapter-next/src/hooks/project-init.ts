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
import semver from "semver";

import { buildSrcPath } from "../lib/buildSrcPath";
import { checkHasAppRouter } from "../lib/checkHasAppRouter";
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
	const hasSrcDirectory = await checkHasProjectFile({
		filename: "src",
		helpers,
	});
	const hasAppRouter = await checkHasAppRouter({ helpers });

	const extension = await getJSFileExtension({ helpers, options });
	const filename = await buildSrcPath({
		filename: `prismicio.${extension}`,
		helpers,
	});

	if (await checkHasProjectFile({ filename, helpers })) {
		return;
	}

	let importsContents: string;
	let createClientContents: string;

	if (hasAppRouter) {
		if (isTypeScriptProject) {
			importsContents = source`
				import {
					createClient as baseCreateClient,
					type ClientConfig,
					type Route,
				} from "@prismicio/client";
				import { enableAutoPreviews } from "@prismicio/next";
				import sm from "${hasSrcDirectory ? ".." : "."}/slicemachine.config.json";
			`;

			createClientContents = source`
				/**
				 * Creates a Prismic client for the project's repository. The client is used to
				 * query content from the Prismic API.
				 *
				 * @param config - Configuration for the Prismic client.
				 */
				export const createClient = (config: ClientConfig = {}) => {
					const client = baseCreateClient(repositoryName, {
						routes,
						fetchOptions:
							process.env.NODE_ENV === 'production'
								? { next: { tags: ['prismic'] }, cache: 'force-cache' }
								: { next: { revalidate: 5 } },
						...config,
					});

					enableAutoPreviews({ client });

					return client;
				};
			`;
		} else {
			importsContents = source`
				import { createClient as baseCreateClient } from "@prismicio/client";
				import { enableAutoPreviews } from "@prismicio/next";
				import sm from "${hasSrcDirectory ? ".." : "."}/slicemachine.config.json";
			`;

			createClientContents = source`
				/**
				 * Creates a Prismic client for the project's repository. The client is used to
				 * query content from the Prismic API.
				 *
				 * @param {import("@prismicio/client").ClientConfig} config - Configuration for the Prismic client.
				 */
				export const createClient = (config = {}) => {
					const client = baseCreateClient(repositoryName, {
						routes,
						fetchOptions:
							process.env.NODE_ENV === 'production'
								? { next: { tags: ['prismic'] }, cache: 'force-cache' }
								: { next: { revalidate: 5 } },
						...config,
					});

					enableAutoPreviews({ client });

					return client;
				};
			`;
		}
	} else {
		if (isTypeScriptProject) {
			importsContents = source`
				import { createClient as baseCreateClient, type Routes } from "@prismicio/client";
				import { enableAutoPreviews, type CreateClientConfig } from "@prismicio/next/pages";
				import sm from "${hasSrcDirectory ? ".." : "."}/slicemachine.config.json";
			`;

			createClientContents = source`
				/**
				 * Creates a Prismic client for the project's repository. The client is used to
				 * query content from the Prismic API.
				 *
				 * @param config - Configuration for the Prismic client.
				 */
				export const createClient = ({ previewData, req, ...config }: CreateClientConfig = {}) => {
					const client = baseCreateClient(repositoryName, {
						routes,
						...config,
					});

					enableAutoPreviews({ client, previewData, req });

					return client;
				};
			`;
		} else {
			importsContents = source`
				import { createClient as baseCreateClient } from "@prismicio/client";
				import { enableAutoPreviews } from "@prismicio/next/pages";
				import sm from "${hasSrcDirectory ? ".." : "."}/slicemachine.config.json";
			`;

			createClientContents = source`
				/**
				 * Creates a Prismic client for the project's repository. The client is used to
				 * query content from the Prismic API.
				 *
				 * @param {import("@prismicio/next/pages").CreateClientConfig} config - Configuration for the Prismic client.
				 */
				export const createClient = ({ previewData, req, ...config } = {}) => {
					const client = baseCreateClient(repositoryName, {
						routes,
						...config,
					});

					enableAutoPreviews({ client, previewData, req });

					return client;
				};
			`;
		}
	}

	let contents: string;

	if (isTypeScriptProject) {
		contents = source`
			${importsContents}

			/**
			 * The project's Prismic repository name.
			 */
			export const repositoryName =
				process.env.${PRISMIC_ENVIRONMENT_ENVIRONMENT_VARIABLE_NAME} || sm.repositoryName;

			/**
			 * A list of Route Resolver objects that define how a document's \`url\` field is resolved.
			 *
			 * {@link https://prismic.io/docs/route-resolver#route-resolver}
			 */
			// TODO: Update the routes array to match your project's route structure.
			const routes: Route[] = [
				// Examples:
				// { type: "homepage", path: "/" },
				// { type: "page", path: "/:uid" },
			];

			${createClientContents}
		`;
	} else {
		contents = source`
			${importsContents}

			/**
			 * The project's Prismic repository name.
			 */
			export const repositoryName =
				process.env.${PRISMIC_ENVIRONMENT_ENVIRONMENT_VARIABLE_NAME} || sm.repositoryName;

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
	const hasAppRouter = await checkHasAppRouter({ helpers });

	const extension = await getJSFileExtension({ helpers, options, jsx: true });
	const filename = await buildSrcPath({
		filename: hasAppRouter
			? `app/slice-simulator/page.${extension}`
			: `pages/slice-simulator.${extension}`,
		helpers,
	});

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

				export default async function SliceSimulatorPage({
					searchParams,
				}: SliceSimulatorParams) {
					const { state } = await searchParams
					const slices = getSlices(state);

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

				export default async function SliceSimulatorPage({ searchParams }) {
					const { state } = await searchParams
					const slices = getSlices(state);

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
	const hasAppRouter = await checkHasAppRouter({ helpers });
	const isTypeScriptProject = await checkIsTypeScriptProject({
		helpers,
		options,
	});

	const extension = await getJSFileExtension({ helpers, options });
	const filename = await buildSrcPath({
		filename: hasAppRouter
			? `app/api/preview/route.${extension}`
			: `pages/api/preview.${extension}`,
		helpers,
	});

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
				import { setPreviewData, redirectToPreviewURL } from "@prismicio/next/pages";

				import { createClient } from "../../prismicio";

				export default async function handler(req: NextApiRequest, res: NextApiResponse) {
					const client = createClient({ req });

					setPreviewData({ req, res });

					return await redirectToPreviewURL({ req, res, client });
				};
			`;
		} else {
			contents = source`
				import { setPreviewData, redirectToPreviewURL } from "@prismicio/next/pages";

				import { createClient } from "../../prismicio";

				export default async function handler(req, res) {
					const client = createClient({ req });

					setPreviewData({ req, res });

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
	const hasAppRouter = await checkHasAppRouter({ helpers });
	const isTypeScriptProject = await checkIsTypeScriptProject({
		helpers,
		options,
	});

	const extension = await getJSFileExtension({ helpers, options });
	const filename = await buildSrcPath({
		filename: hasAppRouter
			? `app/api/exit-preview/route.${extension}`
			: `pages/api/exit-preview.${extension}`,
		helpers,
	});

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
				import { exitPreview } from "@prismicio/next/pages";

				export default function handler(req: NextApiRequest, res: NextApiResponse) {
					return exitPreview({ req, res });
				}
			`;
		} else {
			contents = source`
				import { exitPreview } from "@prismicio/next/pages";

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
	const hasSrcDirectory = await checkHasProjectFile({
		filename: "src",
		helpers,
	});
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

	const nextPkg = await import("next/package.json").catch(() => ({
		version: "0",
	}));
	const supportsCacheLife = semver.gte(nextPkg.version, "16.0.0-beta.0");

	const extension = await getJSFileExtension({ helpers, options });
	const filename = await buildSrcPath({
		filename: `app/api/revalidate/route.${extension}`,
		helpers,
	});

	if (await checkHasProjectFile({ filename, helpers })) {
		return;
	}

	const contents = source`
		import { NextResponse } from "next/server";
		import { revalidateTag } from "next/cache";

		export async function POST() {
			revalidateTag("prismic"${supportsCacheLife ? ', "max"' : ""});

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
			createPreviewRoute(context),
			createExitPreviewRoute(context),
			createRevalidateRoute(context),
		]),
	);

	// This must happen after `modifySliceMachineConfig()` since the
	// location of the default Slice library may change.
	await upsertSliceLibraryIndexFiles(context);
};
