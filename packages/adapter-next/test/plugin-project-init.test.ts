import { test, expect, vi, describe, beforeEach } from "vitest";
import { createSliceMachinePluginRunner } from "@slicemachine/plugin-kit";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import prettier from "prettier";

import adapter from "../src";

test("installs dependencies", async (ctx) => {
	const log = vi.fn();
	const installDependencies = vi.fn();

	await ctx.pluginRunner.callHook("project:init", { log, installDependencies });

	expect(installDependencies).toHaveBeenCalledWith({
		dependencies: {
			"@prismicio/client": "latest",
			"@prismicio/react": "latest",
			"@prismicio/next": "latest",
		},
	});
});

test("creates all Slice library index files", async (ctx) => {
	await fs.writeFile(
		path.join(ctx.project.root, "slicemachine.config.json"),
		JSON.stringify({
			...ctx.project.config,
			libraries: ["./foo", "./bar"],
		}),
	);

	await ctx.pluginRunner.callHook("project:init", {
		log: vi.fn(),
		installDependencies: vi.fn(),
	});

	expect(await fs.readdir(path.join(ctx.project.root, "foo"))).includes(
		"index.js",
	);
	expect(await fs.readdir(path.join(ctx.project.root, "bar"))).includes(
		"index.js",
	);
});

test("doesn't throw if no Slice libraries are configured", async (ctx) => {
	ctx.project.config.libraries = undefined;
	const pluginRunner = createSliceMachinePluginRunner({
		project: ctx.project,
		nativePlugins: {
			[ctx.project.config.adapter.resolve]: adapter,
		},
	});
	await pluginRunner.init();

	await expect(
		ctx.pluginRunner.callHook("project:init", {
			log: vi.fn(),
			installDependencies: vi.fn(),
		}),
	).resolves.toStrictEqual(
		expect.objectContaining({
			errors: [],
		}),
	);
});

describe("modify slicemachine.config.json", () => {
	test("adds default localSliceSimulatorURL", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = JSON.parse(
			await fs.readFile(
				path.join(ctx.project.root, "slicemachine.config.json"),
				"utf8",
			),
		);

		expect(contents.localSliceSimulatorURL).toBe(
			"http://localhost:3000/slice-simulator",
		);
	});

	test("does not modify localSliceSimulatorURL if it already exists", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		const preHookConfig = {
			...ctx.project.config,
			localSliceSimulatorURL: "foo",
		};

		await fs.writeFile(
			path.join(ctx.project.root, "slicemachine.config.json"),
			JSON.stringify(preHookConfig),
		);

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = JSON.parse(
			await fs.readFile(
				path.join(ctx.project.root, "slicemachine.config.json"),
				"utf8",
			),
		);

		expect(contents.localSliceSimulatorURL).toBe(
			preHookConfig.localSliceSimulatorURL,
		);
	});

	test("nests default Slice Library under src directory if it exists", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		await fs.mkdir(path.join(ctx.project.root, "src"), { recursive: true });

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = JSON.parse(
			await fs.readFile(
				path.join(ctx.project.root, "slicemachine.config.json"),
				"utf8",
			),
		);

		expect(contents.libraries).toStrictEqual(["./src/slices"]);
	});

	test("does not nest the default Slice Library under src directory if it is not empty", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		await fs.mkdir(path.join(ctx.project.root, "src"), { recursive: true });

		await fs.mkdir(path.join(ctx.project.root, "slices", "FooBar"), {
			recursive: true,
		});
		await fs.writeFile(
			path.join(ctx.project.root, "slices", "FooBar", "model.json"),
			JSON.stringify(ctx.mock.model.sharedSlice()),
		);

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = JSON.parse(
			await fs.readFile(
				path.join(ctx.project.root, "slicemachine.config.json"),
				"utf8",
			),
		);

		expect(contents.libraries).toStrictEqual(["./slices"]);
	});

	test("does not modify Slice Library if it is not the default", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		const preHookConfig = {
			...ctx.project.config,
			libraries: ["./foo"],
		};

		await fs.writeFile(
			path.join(ctx.project.root, "slicemachine.config.json"),
			JSON.stringify(preHookConfig),
		);

		await fs.mkdir(path.join(ctx.project.root, "src"), { recursive: true });

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = JSON.parse(
			await fs.readFile(
				path.join(ctx.project.root, "slicemachine.config.json"),
				"utf8",
			),
		);

		expect(contents.libraries).toStrictEqual(preHookConfig.libraries);
	});
});

describe("prismicio.js file", () => {
	test("does not overwrite prismicio file if it already exists", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		const filePath = path.join(ctx.project.root, "prismicio.js");
		const contents = "foo";

		await fs.writeFile(filePath, contents);

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const postHookContents = await fs.readFile(filePath, "utf8");

		expect(postHookContents).toBe(contents);
	});

	test("prismicio file is formatted by default", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = await fs.readFile(
			path.join(ctx.project.root, "prismicio.js"),
			"utf8",
		);

		expect(contents).toBe(
			await prettier.format(contents, { parser: "typescript" }),
		);
	});

	test("prismicio file is not formatted if formatting is disabled", async (ctx) => {
		ctx.project.config.adapter.options.format = false;
		const pluginRunner = createSliceMachinePluginRunner({
			project: ctx.project,
			nativePlugins: {
				[ctx.project.config.adapter.resolve]: adapter,
			},
		});
		await pluginRunner.init();

		// Force unusual formatting to detect that formatting did not happen.
		const prettierOptions = { printWidth: 10 };
		await fs.writeFile(
			path.join(ctx.project.root, ".prettierrc"),
			JSON.stringify(prettierOptions),
		);

		const log = vi.fn();
		const installDependencies = vi.fn();

		await pluginRunner.callHook("project:init", { log, installDependencies });

		const contents = await fs.readFile(
			path.join(ctx.project.root, "prismicio.js"),
			"utf8",
		);

		expect(contents).not.toBe(
			await prettier.format(contents, {
				...prettierOptions,
				parser: "typescript",
			}),
		);
	});

	describe("App Router", () => {
		beforeEach(async (ctx) => {
			await fs.mkdir(path.join(ctx.project.root, "app"), { recursive: true });
		});

		test("creates a prismicio.js file", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const contents = await fs.readFile(
				path.join(ctx.project.root, "prismicio.js"),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import { createClient as baseCreateClient } from \\"@prismicio/client\\";
				import { enableAutoPreviews } from \\"@prismicio/next\\";
				import sm from \\"./slicemachine.config.json\\";

				/**
				 * The project's Prismic repository name.
				 */
				export const repositoryName =
				  process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || sm.repositoryName;

				/**
				 * A list of Route Resolver objects that define how a document's \`url\` field is resolved.
				 *
				 * {@link https://prismic.io/docs/route-resolver#route-resolver}
				 *
				 * @type {import(\\"@prismicio/client\\").Route[]}
				 */
				// TODO: Update the routes array to match your project's route structure.
				const routes = [
				  // Examples:
				  // { type: \\"homepage\\", path: \\"/\\" },
				  // { type: \\"page\\", path: \\"/:uid\\" },
				];

				/**
				 * Creates a Prismic client for the project's repository. The client is used to
				 * query content from the Prismic API.
				 *
				 * @param {import(\\"@prismicio/client\\").ClientConfig} config - Configuration for the Prismic client.
				 */
				export const createClient = (config = {}) => {
				  const client = baseCreateClient(repositoryName, {
				    routes,
				    fetchOptions:
				      process.env.NODE_ENV === \\"production\\"
				        ? { next: { tags: [\\"prismic\\"] }, cache: \\"force-cache\\" }
				        : { next: { revalidate: 5 } },
				    ...config,
				  });

				  enableAutoPreviews({ client });

				  return client;
				};
				"
			`);
		});

		test("creates a prismicio.js file in the src directory if it exists", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			await fs.mkdir(path.join(ctx.project.root, "src"), { recursive: true });

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const contents = await fs.readFile(
				path.join(ctx.project.root, "src", "prismicio.js"),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import { createClient as baseCreateClient } from \\"@prismicio/client\\";
				import { enableAutoPreviews } from \\"@prismicio/next/pages\\";
				import sm from \\"../slicemachine.config.json\\";

				/**
				 * The project's Prismic repository name.
				 */
				export const repositoryName =
				  process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || sm.repositoryName;

				/**
				 * A list of Route Resolver objects that define how a document's \`url\` field is resolved.
				 *
				 * {@link https://prismic.io/docs/route-resolver#route-resolver}
				 *
				 * @type {import(\\"@prismicio/client\\").Route[]}
				 */
				// TODO: Update the routes array to match your project's route structure.
				const routes = [
				  // Examples:
				  // { type: \\"homepage\\", path: \\"/\\" },
				  // { type: \\"page\\", path: \\"/:uid\\" },
				];

				/**
				 * Creates a Prismic client for the project's repository. The client is used to
				 * query content from the Prismic API.
				 *
				 * @param {import(\\"@prismicio/next/pages\\").CreateClientConfig} config - Configuration for the Prismic client.
				 */
				export const createClient = ({ previewData, req, ...config } = {}) => {
				  const client = baseCreateClient(repositoryName, {
				    routes,
				    ...config,
				  });

				  enableAutoPreviews({ client, previewData, req });

				  return client;
				};
				"
			`);
		});

		test("creates a prismicio.ts file when TypeScript is enabled", async (ctx) => {
			ctx.project.config.adapter.options.typescript = true;
			const pluginRunner = createSliceMachinePluginRunner({
				project: ctx.project,
				nativePlugins: {
					[ctx.project.config.adapter.resolve]: adapter,
				},
			});
			await pluginRunner.init();

			const log = vi.fn();
			const installDependencies = vi.fn();

			await pluginRunner.callHook("project:init", { log, installDependencies });

			const contents = await fs.readFile(
				path.join(ctx.project.root, "prismicio.ts"),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import {
				  createClient as baseCreateClient,
				  type ClientConfig,
				  type Route,
				} from \\"@prismicio/client\\";
				import { enableAutoPreviews } from \\"@prismicio/next\\";
				import sm from \\"./slicemachine.config.json\\";

				/**
				 * The project's Prismic repository name.
				 */
				export const repositoryName =
				  process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || sm.repositoryName;

				/**
				 * A list of Route Resolver objects that define how a document's \`url\` field is resolved.
				 *
				 * {@link https://prismic.io/docs/route-resolver#route-resolver}
				 */
				// TODO: Update the routes array to match your project's route structure.
				const routes: Route[] = [
				  // Examples:
				  // { type: \\"homepage\\", path: \\"/\\" },
				  // { type: \\"page\\", path: \\"/:uid\\" },
				];

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
				      process.env.NODE_ENV === \\"production\\"
				        ? { next: { tags: [\\"prismic\\"] }, cache: \\"force-cache\\" }
				        : { next: { revalidate: 5 } },
				    ...config,
				  });

				  enableAutoPreviews({ client });

				  return client;
				};
				"
			`);
		});

		test("creates a prismicio.ts file when TypeScript is detected", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			await fs.writeFile(
				path.join(ctx.project.root, "tsconfig.json"),
				JSON.stringify({}),
			);

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const contents = await fs.readFile(
				path.join(ctx.project.root, "prismicio.ts"),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import {
				  createClient as baseCreateClient,
				  type ClientConfig,
				  type Route,
				} from \\"@prismicio/client\\";
				import { enableAutoPreviews } from \\"@prismicio/next\\";
				import sm from \\"./slicemachine.config.json\\";

				/**
				 * The project's Prismic repository name.
				 */
				export const repositoryName =
				  process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || sm.repositoryName;

				/**
				 * A list of Route Resolver objects that define how a document's \`url\` field is resolved.
				 *
				 * {@link https://prismic.io/docs/route-resolver#route-resolver}
				 */
				// TODO: Update the routes array to match your project's route structure.
				const routes: Route[] = [
				  // Examples:
				  // { type: \\"homepage\\", path: \\"/\\" },
				  // { type: \\"page\\", path: \\"/:uid\\" },
				];

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
				      process.env.NODE_ENV === \\"production\\"
				        ? { next: { tags: [\\"prismic\\"] }, cache: \\"force-cache\\" }
				        : { next: { revalidate: 5 } },
				    ...config,
				  });

				  enableAutoPreviews({ client });

				  return client;
				};
				"
			`);
		});
	});

	describe("Pages Router", () => {
		test("creates a prismicio.js file", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const contents = await fs.readFile(
				path.join(ctx.project.root, "prismicio.js"),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import { createClient as baseCreateClient } from \\"@prismicio/client\\";
				import { enableAutoPreviews } from \\"@prismicio/next/pages\\";
				import sm from \\"./slicemachine.config.json\\";

				/**
				 * The project's Prismic repository name.
				 */
				export const repositoryName =
				  process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || sm.repositoryName;

				/**
				 * A list of Route Resolver objects that define how a document's \`url\` field is resolved.
				 *
				 * {@link https://prismic.io/docs/route-resolver#route-resolver}
				 *
				 * @type {import(\\"@prismicio/client\\").Route[]}
				 */
				// TODO: Update the routes array to match your project's route structure.
				const routes = [
				  // Examples:
				  // { type: \\"homepage\\", path: \\"/\\" },
				  // { type: \\"page\\", path: \\"/:uid\\" },
				];

				/**
				 * Creates a Prismic client for the project's repository. The client is used to
				 * query content from the Prismic API.
				 *
				 * @param {import(\\"@prismicio/next/pages\\").CreateClientConfig} config - Configuration for the Prismic client.
				 */
				export const createClient = ({ previewData, req, ...config } = {}) => {
				  const client = baseCreateClient(repositoryName, {
				    routes,
				    ...config,
				  });

				  enableAutoPreviews({ client, previewData, req });

				  return client;
				};
				"
			`);
		});

		test("creates a prismicio.js file in the src directory if it exists", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			await fs.mkdir(path.join(ctx.project.root, "src"), { recursive: true });

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const contents = await fs.readFile(
				path.join(ctx.project.root, "src", "prismicio.js"),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import { createClient as baseCreateClient } from \\"@prismicio/client\\";
				import { enableAutoPreviews } from \\"@prismicio/next/pages\\";
				import sm from \\"../slicemachine.config.json\\";

				/**
				 * The project's Prismic repository name.
				 */
				export const repositoryName =
				  process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || sm.repositoryName;

				/**
				 * A list of Route Resolver objects that define how a document's \`url\` field is resolved.
				 *
				 * {@link https://prismic.io/docs/route-resolver#route-resolver}
				 *
				 * @type {import(\\"@prismicio/client\\").Route[]}
				 */
				// TODO: Update the routes array to match your project's route structure.
				const routes = [
				  // Examples:
				  // { type: \\"homepage\\", path: \\"/\\" },
				  // { type: \\"page\\", path: \\"/:uid\\" },
				];

				/**
				 * Creates a Prismic client for the project's repository. The client is used to
				 * query content from the Prismic API.
				 *
				 * @param {import(\\"@prismicio/next/pages\\").CreateClientConfig} config - Configuration for the Prismic client.
				 */
				export const createClient = ({ previewData, req, ...config } = {}) => {
				  const client = baseCreateClient(repositoryName, {
				    routes,
				    ...config,
				  });

				  enableAutoPreviews({ client, previewData, req });

				  return client;
				};
				"
			`);
		});

		test("creates a prismicio.ts file when TypeScript is enabled", async (ctx) => {
			ctx.project.config.adapter.options.typescript = true;
			const pluginRunner = createSliceMachinePluginRunner({
				project: ctx.project,
				nativePlugins: {
					[ctx.project.config.adapter.resolve]: adapter,
				},
			});
			await pluginRunner.init();

			const log = vi.fn();
			const installDependencies = vi.fn();

			await pluginRunner.callHook("project:init", { log, installDependencies });

			const contents = await fs.readFile(
				path.join(ctx.project.root, "prismicio.ts"),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import {
				  createClient as baseCreateClient,
				  type Routes,
				} from \\"@prismicio/client\\";
				import {
				  enableAutoPreviews,
				  type CreateClientConfig,
				} from \\"@prismicio/next/pages\\";
				import sm from \\"./slicemachine.config.json\\";

				/**
				 * The project's Prismic repository name.
				 */
				export const repositoryName =
				  process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || sm.repositoryName;

				/**
				 * A list of Route Resolver objects that define how a document's \`url\` field is resolved.
				 *
				 * {@link https://prismic.io/docs/route-resolver#route-resolver}
				 */
				// TODO: Update the routes array to match your project's route structure.
				const routes: Route[] = [
				  // Examples:
				  // { type: \\"homepage\\", path: \\"/\\" },
				  // { type: \\"page\\", path: \\"/:uid\\" },
				];

				/**
				 * Creates a Prismic client for the project's repository. The client is used to
				 * query content from the Prismic API.
				 *
				 * @param config - Configuration for the Prismic client.
				 */
				export const createClient = ({
				  previewData,
				  req,
				  ...config
				}: CreateClientConfig = {}) => {
				  const client = baseCreateClient(repositoryName, {
				    routes,
				    ...config,
				  });

				  enableAutoPreviews({ client, previewData, req });

				  return client;
				};
				"
			`);
		});

		test("creates a prismicio.ts file when TypeScript is detected", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			await fs.writeFile(
				path.join(ctx.project.root, "tsconfig.json"),
				JSON.stringify({}),
			);

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const contents = await fs.readFile(
				path.join(ctx.project.root, "prismicio.ts"),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import {
				  createClient as baseCreateClient,
				  type Routes,
				} from \\"@prismicio/client\\";
				import {
				  enableAutoPreviews,
				  type CreateClientConfig,
				} from \\"@prismicio/next/pages\\";
				import sm from \\"./slicemachine.config.json\\";

				/**
				 * The project's Prismic repository name.
				 */
				export const repositoryName =
				  process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || sm.repositoryName;

				/**
				 * A list of Route Resolver objects that define how a document's \`url\` field is resolved.
				 *
				 * {@link https://prismic.io/docs/route-resolver#route-resolver}
				 */
				// TODO: Update the routes array to match your project's route structure.
				const routes: Route[] = [
				  // Examples:
				  // { type: \\"homepage\\", path: \\"/\\" },
				  // { type: \\"page\\", path: \\"/:uid\\" },
				];

				/**
				 * Creates a Prismic client for the project's repository. The client is used to
				 * query content from the Prismic API.
				 *
				 * @param config - Configuration for the Prismic client.
				 */
				export const createClient = ({
				  previewData,
				  req,
				  ...config
				}: CreateClientConfig = {}) => {
				  const client = baseCreateClient(repositoryName, {
				    routes,
				    ...config,
				  });

				  enableAutoPreviews({ client, previewData, req });

				  return client;
				};
				"
			`);
		});
	});
});

describe("Slice Simulator route", () => {
	describe("App Router", () => {
		beforeEach(async (ctx) => {
			await fs.mkdir(path.join(ctx.project.root, "app"), { recursive: true });
		});

		test("creates a Slice Simulator page file", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const contents = await fs.readFile(
				path.join(ctx.project.root, "app", "slice-simulator", "page.js"),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import {
				  SliceSimulator,
				  getSlices,
				} from \\"@slicemachine/adapter-next/simulator\\";
				import { SliceZone } from \\"@prismicio/react\\";

				import { components } from \\"../../slices\\";

				export default async function SliceSimulatorPage({ searchParams }) {
				  const { state } = await searchParams;
				  const slices = getSlices(state);

				  return (
				    <SliceSimulator>
				      <SliceZone slices={slices} components={components} />
				    </SliceSimulator>
				  );
				}
				"
			`);
		});

		test("does not overwrite Slice Simulator page file if it already exists", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			const filePath = path.join(
				ctx.project.root,
				"app",
				"slice-simulator",
				"page.js",
			);
			const contents = "foo";

			await fs.mkdir(path.dirname(filePath), { recursive: true });
			await fs.writeFile(filePath, contents);

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const postHookContents = await fs.readFile(filePath, "utf8");

			expect(postHookContents).toBe(contents);
		});

		test("creates Slice Simulator page file in the src directory if it exists", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			await fs.mkdir(path.join(ctx.project.root, "src", "app"), {
				recursive: true,
			});

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const contents = await fs.readFile(
				path.join(ctx.project.root, "src", "app", "slice-simulator", "page.js"),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import {
				  SliceSimulator,
				  getSlices,
				} from \\"@slicemachine/adapter-next/simulator\\";
				import { SliceZone } from \\"@prismicio/react\\";

				import { components } from \\"../../slices\\";

				export default async function SliceSimulatorPage({ searchParams }) {
				  const { state } = await searchParams;
				  const slices = getSlices(state);

				  return (
				    <SliceSimulator>
				      <SliceZone slices={slices} components={components} />
				    </SliceSimulator>
				  );
				}
				"
			`);
		});

		test("Slice Simulator page file is formatted by default", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const contents = await fs.readFile(
				path.join(ctx.project.root, "app", "slice-simulator", "page.js"),
				"utf8",
			);

			expect(contents).toBe(
				await prettier.format(contents, { parser: "typescript" }),
			);
		});

		test("Slice Simulator page file is not formatted if formatting is disabled", async (ctx) => {
			ctx.project.config.adapter.options.format = false;
			const pluginRunner = createSliceMachinePluginRunner({
				project: ctx.project,
				nativePlugins: {
					[ctx.project.config.adapter.resolve]: adapter,
				},
			});
			await pluginRunner.init();

			// Force unusual formatting to detect that formatting did not happen.
			const prettierOptions = { printWidth: 10 };
			await fs.writeFile(
				path.join(ctx.project.root, ".prettierrc"),
				JSON.stringify(prettierOptions),
			);

			const log = vi.fn();
			const installDependencies = vi.fn();

			await pluginRunner.callHook("project:init", { log, installDependencies });

			const contents = await fs.readFile(
				path.join(ctx.project.root, "app", "slice-simulator", "page.js"),
				"utf8",
			);

			expect(contents).not.toBe(
				await prettier.format(contents, {
					...prettierOptions,
					parser: "typescript",
				}),
			);
		});

		test("creates a Slice Simulator TypeScript page file when TypeScript is enabled", async (ctx) => {
			ctx.project.config.adapter.options.typescript = true;
			const pluginRunner = createSliceMachinePluginRunner({
				project: ctx.project,
				nativePlugins: {
					[ctx.project.config.adapter.resolve]: adapter,
				},
			});
			await pluginRunner.init();

			const log = vi.fn();
			const installDependencies = vi.fn();

			await pluginRunner.callHook("project:init", { log, installDependencies });

			const contents = await fs.readFile(
				path.join(ctx.project.root, "app", "slice-simulator", "page.tsx"),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import {
				  SliceSimulator,
				  SliceSimulatorParams,
				  getSlices,
				} from \\"@slicemachine/adapter-next/simulator\\";
				import { SliceZone } from \\"@prismicio/react\\";

				import { components } from \\"../../slices\\";

				export default async function SliceSimulatorPage({
				  searchParams,
				}: SliceSimulatorParams) {
				  const { state } = await searchParams;
				  const slices = getSlices(state);

				  return (
				    <SliceSimulator>
				      <SliceZone slices={slices} components={components} />
				    </SliceSimulator>
				  );
				}
				"
			`);
		});
	});

	describe("Pages Router", () => {
		test("creates a Slice Simulator page file", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const contents = await fs.readFile(
				path.join(ctx.project.root, "pages", "slice-simulator.js"),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import { SliceSimulator } from \\"@slicemachine/adapter-next/simulator\\";
				import { SliceZone } from \\"@prismicio/react\\";

				import { components } from \\"../slices\\";

				export default function SliceSimulatorPage() {
				  return (
				    <SliceSimulator
				      sliceZone={(props) => <SliceZone {...props} components={components} />}
				    />
				  );
				}
				"
			`);
		});

		test("does not overwrite Slice Simulator page file if it already exists", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			const filePath = path.join(
				ctx.project.root,
				"pages",
				"slice-simulator.js",
			);
			const contents = "foo";

			await fs.mkdir(path.dirname(filePath), { recursive: true });
			await fs.writeFile(filePath, contents);

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const postHookContents = await fs.readFile(filePath, "utf8");

			expect(postHookContents).toBe(contents);
		});

		test("creates Slice Simulator page file in the src directory if it exists", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			await fs.mkdir(path.join(ctx.project.root, "src"));

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const contents = await fs.readFile(
				path.join(ctx.project.root, "src", "pages", "slice-simulator.js"),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import { SliceSimulator } from \\"@slicemachine/adapter-next/simulator\\";
				import { SliceZone } from \\"@prismicio/react\\";

				import { components } from \\"../slices\\";

				export default function SliceSimulatorPage() {
				  return (
				    <SliceSimulator
				      sliceZone={(props) => <SliceZone {...props} components={components} />}
				    />
				  );
				}
				"
			`);
		});

		test("Slice Simulator page file is formatted by default", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const contents = await fs.readFile(
				path.join(ctx.project.root, "pages", "slice-simulator.js"),
				"utf8",
			);

			expect(contents).toBe(
				await prettier.format(contents, { parser: "typescript" }),
			);
		});

		test("Slice Simulator page file is not formatted if formatting is disabled", async (ctx) => {
			ctx.project.config.adapter.options.format = false;
			const pluginRunner = createSliceMachinePluginRunner({
				project: ctx.project,
				nativePlugins: {
					[ctx.project.config.adapter.resolve]: adapter,
				},
			});
			await pluginRunner.init();

			// Force unusual formatting to detect that formatting did not happen.
			const prettierOptions = { printWidth: 10 };
			await fs.writeFile(
				path.join(ctx.project.root, ".prettierrc"),
				JSON.stringify(prettierOptions),
			);

			const log = vi.fn();
			const installDependencies = vi.fn();

			await pluginRunner.callHook("project:init", { log, installDependencies });

			const contents = await fs.readFile(
				path.join(ctx.project.root, "pages", "slice-simulator.js"),
				"utf8",
			);

			expect(contents).not.toBe(
				await prettier.format(contents, {
					...prettierOptions,
					parser: "typescript",
				}),
			);
		});

		test("creates a Slice Simulator TypeScript page file when TypeScript is enabled", async (ctx) => {
			ctx.project.config.adapter.options.typescript = true;
			const pluginRunner = createSliceMachinePluginRunner({
				project: ctx.project,
				nativePlugins: {
					[ctx.project.config.adapter.resolve]: adapter,
				},
			});
			await pluginRunner.init();

			const log = vi.fn();
			const installDependencies = vi.fn();

			await pluginRunner.callHook("project:init", { log, installDependencies });

			const contents = await fs.readFile(
				path.join(ctx.project.root, "pages", "slice-simulator.tsx"),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import { SliceSimulator } from \\"@slicemachine/adapter-next/simulator\\";
				import { SliceZone } from \\"@prismicio/react\\";

				import { components } from \\"../slices\\";

				export default function SliceSimulatorPage() {
				  return (
				    <SliceSimulator
				      sliceZone={(props) => <SliceZone {...props} components={components} />}
				    />
				  );
				}
				"
			`);
		});
	});
});

describe("/api/preview route", () => {
	describe("App Router", () => {
		beforeEach(async (ctx) => {
			await fs.mkdir(path.join(ctx.project.root, "app"), { recursive: true });
		});

		test("creates a route handler", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const contents = await fs.readFile(
				path.join(ctx.project.root, "app", "api", "preview", "route.js"),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import { redirectToPreviewURL } from \\"@prismicio/next\\";

				import { createClient } from \\"../../../prismicio\\";

				export async function GET(request) {
				  const client = createClient();

				  return await redirectToPreviewURL({ client, request });
				}
				"
			`);
		});

		test("creates a route in the src directory if it exists", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			await fs.mkdir(path.join(ctx.project.root, "src", "app"), {
				recursive: true,
			});

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const contents = await fs.readFile(
				path.join(ctx.project.root, "src", "app", "api", "preview", "route.js"),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import { redirectToPreviewURL } from \\"@prismicio/next\\";

				import { createClient } from \\"../../../prismicio\\";

				export async function GET(request) {
				  const client = createClient();

				  return await redirectToPreviewURL({ client, request });
				}
				"
			`);
		});

		test("creates a TypeScript file when TypeScript is enabled", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			await fs.writeFile(
				path.join(ctx.project.root, "tsconfig.json"),
				JSON.stringify({}),
			);

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const contents = await fs.readFile(
				path.join(ctx.project.root, "app", "api", "preview", "route.ts"),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import { NextRequest } from \\"next/server\\";
				import { redirectToPreviewURL } from \\"@prismicio/next\\";

				import { createClient } from \\"../../../prismicio\\";

				export async function GET(request: NextRequest) {
				  const client = createClient();

				  return await redirectToPreviewURL({ client, request });
				}
				"
			`);
		});
	});

	describe("Pages Router", () => {
		test("creates a route handler", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const contents = await fs.readFile(
				path.join(ctx.project.root, "pages", "api", "preview.js"),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import { setPreviewData, redirectToPreviewURL } from \\"@prismicio/next/pages\\";

				import { createClient } from \\"../../prismicio\\";

				export default async function handler(req, res) {
				  const client = createClient({ req });

				  setPreviewData({ req, res });

				  return await redirectToPreviewURL({ req, res, client });
				}
				"
			`);
		});

		test("creates a route in the src directory if it exists", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			await fs.mkdir(path.join(ctx.project.root, "src"), {
				recursive: true,
			});

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const contents = await fs.readFile(
				path.join(ctx.project.root, "src", "pages", "api", "preview.js"),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import { setPreviewData, redirectToPreviewURL } from \\"@prismicio/next/pages\\";

				import { createClient } from \\"../../prismicio\\";

				export default async function handler(req, res) {
				  const client = createClient({ req });

				  setPreviewData({ req, res });

				  return await redirectToPreviewURL({ req, res, client });
				}
				"
			`);
		});

		test("creates a TypeScript file when TypeScript is enabled", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			await fs.writeFile(
				path.join(ctx.project.root, "tsconfig.json"),
				JSON.stringify({}),
			);

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const contents = await fs.readFile(
				path.join(ctx.project.root, "pages", "api", "preview.ts"),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import { NextApiRequest, NextApiResponse } from \\"next\\";
				import { setPreviewData, redirectToPreviewURL } from \\"@prismicio/next/pages\\";

				import { createClient } from \\"../../prismicio\\";

				export default async function handler(
				  req: NextApiRequest,
				  res: NextApiResponse,
				) {
				  const client = createClient({ req });

				  setPreviewData({ req, res });

				  return await redirectToPreviewURL({ req, res, client });
				}
				"
			`);
		});
	});
});

describe("/api/exit-preview route", () => {
	describe("App Router", () => {
		beforeEach(async (ctx) => {
			await fs.mkdir(path.join(ctx.project.root, "app"), { recursive: true });
		});

		test("creates a route handler", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const contents = await fs.readFile(
				path.join(ctx.project.root, "app", "api", "exit-preview", "route.js"),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import { exitPreview } from \\"@prismicio/next\\";

				export function GET() {
				  return exitPreview();
				}
				"
			`);
		});

		test("creates a route in the src directory if it exists", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			await fs.mkdir(path.join(ctx.project.root, "src", "app"), {
				recursive: true,
			});

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const contents = await fs.readFile(
				path.join(
					ctx.project.root,
					"src",
					"app",
					"api",
					"exit-preview",
					"route.js",
				),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import { exitPreview } from \\"@prismicio/next\\";

				export function GET() {
				  return exitPreview();
				}
				"
			`);
		});

		test("creates a TypeScript file when TypeScript is enabled", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			await fs.writeFile(
				path.join(ctx.project.root, "tsconfig.json"),
				JSON.stringify({}),
			);

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const contents = await fs.readFile(
				path.join(ctx.project.root, "app", "api", "exit-preview", "route.ts"),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import { exitPreview } from \\"@prismicio/next\\";

				export function GET() {
				  return exitPreview();
				}
				"
			`);
		});
	});

	describe("Pages Router", () => {
		test("creates a route handler", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const contents = await fs.readFile(
				path.join(ctx.project.root, "pages", "api", "exit-preview.js"),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import { exitPreview } from \\"@prismicio/next/pages\\";

				export default function handler(req, res) {
				  return exitPreview({ req, res });
				}
				"
			`);
		});

		test("creates a route in the src directory if it exists", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			await fs.mkdir(path.join(ctx.project.root, "src"), {
				recursive: true,
			});

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const contents = await fs.readFile(
				path.join(ctx.project.root, "src", "pages", "api", "exit-preview.js"),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import { exitPreview } from \\"@prismicio/next/pages\\";

				export default function handler(req, res) {
				  return exitPreview({ req, res });
				}
				"
			`);
		});

		test("creates a TypeScript file when TypeScript is enabled", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			await fs.writeFile(
				path.join(ctx.project.root, "tsconfig.json"),
				JSON.stringify({}),
			);

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const contents = await fs.readFile(
				path.join(ctx.project.root, "pages", "api", "exit-preview.ts"),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import { NextApiRequest, NextApiResponse } from \\"next\\";
				import { exitPreview } from \\"@prismicio/next/pages\\";

				export default function handler(req: NextApiRequest, res: NextApiResponse) {
				  return exitPreview({ req, res });
				}
				"
			`);
		});
	});
});

describe("/api/revalidate route", () => {
	describe("App Router", () => {
		beforeEach(async (ctx) => {
			await fs.mkdir(path.join(ctx.project.root, "app"), { recursive: true });
		});

		test("creates a route handler", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const contents = await fs.readFile(
				path.join(ctx.project.root, "app", "api", "revalidate", "route.js"),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import { NextResponse } from \\"next/server\\";
				import { revalidateTag } from \\"next/cache\\";

				export async function POST() {
				  revalidateTag(\\"prismic\\", \\"max\\");

				  return NextResponse.json({ revalidated: true, now: Date.now() });
				}
				"
			`);
		});

		test("creates a route in the src directory if it exists", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			await fs.mkdir(path.join(ctx.project.root, "src", "app"), {
				recursive: true,
			});

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const contents = await fs.readFile(
				path.join(
					ctx.project.root,
					"src",
					"app",
					"api",
					"revalidate",
					"route.js",
				),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import { NextResponse } from \\"next/server\\";
				import { revalidateTag } from \\"next/cache\\";

				export async function POST() {
				  revalidateTag(\\"prismic\\", \\"max\\");

				  return NextResponse.json({ revalidated: true, now: Date.now() });
				}
				"
			`);
		});

		test("creates a TypeScript file when TypeScript is enabled", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			await fs.writeFile(
				path.join(ctx.project.root, "tsconfig.json"),
				JSON.stringify({}),
			);

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const contents = await fs.readFile(
				path.join(ctx.project.root, "app", "api", "revalidate", "route.ts"),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import { NextResponse } from \\"next/server\\";
				import { revalidateTag } from \\"next/cache\\";

				export async function POST() {
				  revalidateTag(\\"prismic\\", \\"max\\");

				  return NextResponse.json({ revalidated: true, now: Date.now() });
				}
				"
			`);
		});

		test("excludes cacheLife parameter when using Next.js < 16.0.0-beta.0", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			vi.doMock("next/package.json", async () => ({
				default: { version: "15.0.0" },
			}));

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const contents = await fs.readFile(
				path.join(ctx.project.root, "app", "api", "revalidate", "route.js"),
				"utf8",
			);

			expect(contents).toMatchInlineSnapshot(`
				"import { NextResponse } from \\"next/server\\";
				import { revalidateTag } from \\"next/cache\\";

				export async function POST() {
				  revalidateTag(\\"prismic\\");

				  return NextResponse.json({ revalidated: true, now: Date.now() });
				}
				"
			`);

			vi.doUnmock("next/package.json");
		});
	});

	describe("Pages Router", () => {
		test("doesn't create a route handler", async (ctx) => {
			const log = vi.fn();
			const installDependencies = vi.fn();

			await ctx.pluginRunner.callHook("project:init", {
				log,
				installDependencies,
			});

			const apiDir = await fs.readdir(
				path.join(ctx.project.root, "pages", "api"),
			);

			expect(apiDir).not.includes("revalidate.js");
		});
	});
});
