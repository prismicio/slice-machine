import { it, expect, vi, describe } from "vitest";
import { createSliceMachinePluginRunner } from "@slicemachine/plugin-kit";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import prettier from "prettier";

import adapter from "../src";

it("installs dependencies", async (ctx) => {
	const log = vi.fn();
	const installDependencies = vi.fn();

	await ctx.pluginRunner.callHook("project:init", { log, installDependencies });

	expect(installDependencies).toHaveBeenCalledWith({
		dependencies: {
			"@prismicio/client": "latest",
			"@prismicio/svelte": "latest",
		},
	});
});

it("creates all Slice library index files", async (ctx) => {
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

it("doesn't throw if no Slice libraries are configured", async (ctx) => {
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
	it("adds a Slice Simulator URL", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		const preProject = await ctx.pluginRunner.rawHelpers.getProject();

		expect(preProject.config.localSliceSimulatorURL).toBe(undefined);

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const postProject = await ctx.pluginRunner.rawHelpers.getProject();

		expect(postProject.config.localSliceSimulatorURL).toBe(
			"http://localhost:5173/slice-simulator",
		);
	});

	it("nests default Slice Library under src/lib directory if it exists", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		await fs.mkdir(path.join(ctx.project.root, "src", "lib"), {
			recursive: true,
		});

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

		expect(contents.libraries).toStrictEqual(["./src/lib/slices"]);
	});

	it("does not nest the default Slice Library under src/lib directory if it is not empty", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

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

	it("does not modify Slice Library if it is not the default", async (ctx) => {
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
	it("does not overwrite prismicio file if it already exists", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		const filePath = path.join(ctx.project.root, "src", "lib", "prismicio.js");
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

	it("prismicio file is formatted by default", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = await fs.readFile(
			path.join(ctx.project.root, "src", "lib", "prismicio.js"),
			"utf8",
		);

		expect(contents).toBe(
			await prettier.format(contents, { parser: "typescript" }),
		);
	});

	it("prismicio file is not formatted if formatting is disabled", async (ctx) => {
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
			path.join(ctx.project.root, "src", "lib", "prismicio.js"),
			"utf8",
		);

		expect(contents).not.toBe(
			await prettier.format(contents, {
				...prettierOptions,
				parser: "typescript",
			}),
		);
	});

	it("creates a prismicio.js file", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = await fs.readFile(
			path.join(ctx.project.root, "src", "lib", "prismicio.js"),
			"utf8",
		);

		expect(contents).toMatchInlineSnapshot(`
			"import * as prismic from "@prismicio/client";
			import { enableAutoPreviews } from "@prismicio/svelte/kit";
			import config from "../../slicemachine.config.json";

			/**
			 * The project's Prismic repository name.
			 */
			export const repositoryName =
			  import.meta.env.VITE_PRISMIC_ENVIRONMENT || config.repositoryName;

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
			"
		`);
	});

	it("creates a prismicio.ts file when TypeScript is enabled", async (ctx) => {
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
			path.join(ctx.project.root, "src", "lib", "prismicio.ts"),
			"utf8",
		);

		expect(contents).toMatchInlineSnapshot(`
			"import * as prismic from "@prismicio/client";
			import {
			  type CreateClientConfig,
			  enableAutoPreviews,
			} from "@prismicio/svelte/kit";
			import config from "../../slicemachine.config.json";

			/**
			 * The project's Prismic repository name.
			 */
			export const repositoryName =
			  import.meta.env.VITE_PRISMIC_ENVIRONMENT || config.repositoryName;

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

			/**
			 * Creates a Prismic client for the project's repository. The client is used to
			 * query content from the Prismic API.
			 *
			 * @param config - Configuration for the Prismic client.
			 */
			export const createClient = ({
			  cookies,
			  ...config
			}: CreateClientConfig = {}) => {
			  const client = prismic.createClient(repositoryName, {
			    routes,
			    ...config,
			  });

			  enableAutoPreviews({ client, cookies });

			  return client;
			};
			"
		`);
	});
});

describe("/api/preview route", () => {
	it("creates an endpoint", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = await fs.readFile(
			path.join(
				ctx.project.root,
				"src",
				"routes",
				"api",
				"preview",
				"+server.js",
			),
			"utf8",
		);

		expect(contents).toMatchInlineSnapshot(`
			"import { redirectToPreviewURL } from "@prismicio/svelte/kit";
			import { createClient } from "$lib/prismicio";

			export async function GET({ fetch, request, cookies }) {
			  const client = createClient({ fetch });

			  return await redirectToPreviewURL({ client, request, cookies });
			}
			"
		`);
	});

	it("creates a TypeScript file when TypeScript is enabled", async (ctx) => {
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
			path.join(
				ctx.project.root,
				"src",
				"routes",
				"api",
				"preview",
				"+server.ts",
			),
			"utf8",
		);

		expect(contents).toMatchInlineSnapshot(`
			"import { redirectToPreviewURL } from "@prismicio/svelte/kit";
			import { createClient } from "$lib/prismicio";

			export async function GET({ fetch, request, cookies }) {
			  const client = createClient({ fetch });

			  return await redirectToPreviewURL({ client, request, cookies });
			}
			"
		`);
	});

	it("does not overwrite the endpoint file if it already exists", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		const filePath = path.join(
			ctx.project.root,
			"src",
			"routes",
			"api",
			"preview",
			"+server.js",
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

	it("formats the file by default", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = await fs.readFile(
			path.join(
				ctx.project.root,
				"src",
				"routes",
				"api",
				"preview",
				"+server.js",
			),
			"utf8",
		);

		expect(contents).toBe(
			await prettier.format(contents, { parser: "typescript" }),
		);
	});

	it("does not format the file if formatting is disabled", async (ctx) => {
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

		await pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = await fs.readFile(
			path.join(
				ctx.project.root,
				"src",
				"routes",
				"api",
				"preview",
				"+server.js",
			),
			"utf8",
		);

		expect(contents).not.toBe(
			await prettier.format(contents, {
				...prettierOptions,
				parser: "typescript",
			}),
		);
	});
});

describe("preview route directory", () => {
	it("creates a preview route directory", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		await expect(
			fs.access(
				path.join(ctx.project.root, "src", "routes", "[[preview=preview]]"),
			),
		).resolves.not.toThrow();
	});

	it("includes a README.md file", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = await fs.readFile(
			path.join(
				ctx.project.root,
				"src",
				"routes",
				"[[preview=preview]]",
				"README.md",
			),
			"utf8",
		);

		// Ensure the file describes the purpose of the directory.
		expect(contents).toMatch(/\/preview/i);
	});

	it("does not overwrite README file if it already exists", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		const filePath = path.join(
			ctx.project.root,
			"src",
			"routes",
			"[[preview=preview]]",
			"README.md",
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
});

describe("preview route matcher", () => {
	it("creates a preview.js file", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = await fs.readFile(
			path.join(ctx.project.root, "src", "params", "preview.js"),
			"utf8",
		);

		expect(contents).toMatchInlineSnapshot(`
			"export function match(param) {
			  return param === "preview";
			}
			"
		`);
	});

	it("does not overwrite preview.js file if it already exists", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		const filePath = path.join(ctx.project.root, "src", "params", "preview.js");
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

	it("creates a preview.ts file when TypeScript is enabled", async (ctx) => {
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

		await pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = await fs.readFile(
			path.join(ctx.project.root, "src", "params", "preview.ts"),
			"utf8",
		);

		expect(contents).toMatchInlineSnapshot(`
			"export function match(param) {
			  return param === "preview";
			}
			"
		`);
	});

	it("formats the file by default", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = await fs.readFile(
			path.join(ctx.project.root, "src", "params", "preview.js"),
			"utf8",
		);

		expect(contents).toBe(
			await prettier.format(contents, { parser: "typescript" }),
		);
	});

	it("does not format the file if formatting is disabled", async (ctx) => {
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

		await pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = await fs.readFile(
			path.join(ctx.project.root, "src", "params", "preview.js"),
			"utf8",
		);

		expect(contents).not.toBe(
			await prettier.format(contents, {
				...prettierOptions,
				parser: "typescript",
			}),
		);
	});
});

describe("Slice Simulator route", () => {
	it("creates a Slice Simulator page file", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = await fs.readFile(
			path.join(
				ctx.project.root,
				"src",
				"routes",
				"slice-simulator",
				"+page.svelte",
			),
			"utf8",
		);

		expect(contents).toMatchInlineSnapshot(`
			"<script>
			  import { SliceSimulator } from "@slicemachine/adapter-sveltekit/simulator";
			  import { SliceZone } from "@prismicio/svelte";
			  import { components } from "$lib/slices";
			</script>

			<SliceSimulator let:slices>
			  <SliceZone {slices} {components} />
			</SliceSimulator>
			"
		`);
	});

	it("does not overwrite Slice Simulator page file if it already exists", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		const filePath = path.join(
			ctx.project.root,
			"src",
			"routes",
			"slice-simulator",
			"+page.svelte",
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

	it("Slice Simulator page file is formatted by default", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = await fs.readFile(
			path.join(
				ctx.project.root,
				"src",
				"routes",
				"slice-simulator",
				"+page.svelte",
			),
			"utf8",
		);

		expect(contents).toBe(
			await prettier.format(contents, {
				plugins: ["prettier-plugin-svelte"],
				parser: "svelte",
			}),
		);
	});

	it("Slice Simulator page file is not formatted if formatting is disabled", async (ctx) => {
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
			path.join(
				ctx.project.root,
				"src",
				"routes",
				"slice-simulator",
				"+page.svelte",
			),
			"utf8",
		);

		expect(contents).not.toBe(
			await prettier.format(contents, {
				...prettierOptions,
				plugins: ["prettier-plugin-svelte"],
				parser: "svelte",
			}),
		);
	});
});

describe("root layout server file", () => {
	it("creates a root layout server file", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = await fs.readFile(
			path.join(ctx.project.root, "src", "routes", "+layout.server.js"),
			"utf8",
		);

		expect(contents).toMatchInlineSnapshot(`
			"export const prerender = "auto";
			"
		`);
	});

	it("does not overwrite root layout server file if it already exists", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		const filePath = path.join(
			ctx.project.root,
			"src",
			"routes",
			"+layout.server.js",
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

	it("creates a preview.ts file when TypeScript is enabled", async (ctx) => {
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

		await pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = await fs.readFile(
			path.join(ctx.project.root, "src", "routes", "+layout.server.ts"),
			"utf8",
		);

		expect(contents).toMatchInlineSnapshot(`
			"export const prerender = "auto";
			"
		`);
	});

	it("formats the file by default", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = await fs.readFile(
			path.join(ctx.project.root, "src", "routes", "+layout.server.js"),
			"utf8",
		);

		expect(contents).toBe(
			await prettier.format(contents, { parser: "typescript" }),
		);
	});

	it("does not format the file if formatting is disabled", async (ctx) => {
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

		await pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = await fs.readFile(
			path.join(ctx.project.root, "src", "routes", "+layout.server.js"),
			"utf8",
		);

		expect(contents).not.toBe(
			await prettier.format(contents, {
				...prettierOptions,
				parser: "typescript",
			}),
		);
	});
});

describe("root layout file", () => {
	it("creates a root layout file", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = await fs.readFile(
			path.join(ctx.project.root, "src", "routes", "+layout.svelte"),
			"utf8",
		);

		expect(contents).toMatchInlineSnapshot(`
			"<script>
			  import { isFilled, asImageSrc } from "@prismicio/client";
			  import { PrismicPreview } from "@prismicio/svelte/kit";
			  import { page } from "$app/state";
			  import { repositoryName } from "$lib/prismicio";
			</script>

			<svelte:head>
			  <title>{page.data.page?.data.meta_title}</title>
			  <meta property="og:title" content={page.data.page?.data.meta_title} />
			  {#if isFilled.keyText(page.data.page?.data.meta_description)}
			    <meta name="description" content={page.data.page.data.meta_description} />
			    <meta
			      property="og:description"
			      content={page.data.page.data.meta_description}
			    />
			  {/if}
			  {#if isFilled.image(page.data.page?.data.meta_image)}
			    <meta
			      property="og:image"
			      content={asImageSrc(page.data.page.data.meta_image)}
			    />
			  {/if}
			</svelte:head>
			<slot />
			<PrismicPreview {repositoryName} />
			"
		`);
	});

	it("does not overwrite root layout server file if it already exists", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		const filePath = path.join(
			ctx.project.root,
			"src",
			"routes",
			"+layout.svelte",
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

	it("formats the file by default", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = await fs.readFile(
			path.join(ctx.project.root, "src", "routes", "+layout.svelte"),
			"utf8",
		);

		expect(contents).toBe(
			await prettier.format(contents, {
				plugins: ["prettier-plugin-svelte"],
				parser: "svelte",
			}),
		);
	});

	it("does not format the file if formatting is disabled", async (ctx) => {
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

		await pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = await fs.readFile(
			path.join(ctx.project.root, "src", "routes", "+layout.svelte"),
			"utf8",
		);

		expect(contents).not.toBe(
			await prettier.format(contents, {
				...prettierOptions,
				plugins: ["prettier-plugin-svelte"],
				parser: "svelte",
			}),
		);
	});
});
