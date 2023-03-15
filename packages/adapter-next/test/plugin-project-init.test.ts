import { test, expect, vi } from "vitest";
import { createSliceMachinePluginRunner } from "@slicemachine/plugin-kit";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import prettier from "prettier";

import { parseSourceFile } from "./__testutils__/parseSourceFile";

test("installs dependencies", async (ctx) => {
	const log = vi.fn();
	const installDependencies = vi.fn();

	await ctx.pluginRunner.callHook("project:init", { log, installDependencies });

	expect(installDependencies).toHaveBeenCalledWith({
		dependencies: {
			"@prismicio/client": "latest",
			"@prismicio/helpers": "latest",
			"@prismicio/react": "latest",
			"@prismicio/next": "latest",
		},
	});
	expect(installDependencies).toHaveBeenCalledWith({
		dependencies: {
			"@prismicio/types": "latest",
		},
		dev: true,
	});
});

test("creates a prismicio.js file", async (ctx) => {
	const log = vi.fn();
	const installDependencies = vi.fn();

	await ctx.pluginRunner.callHook("project:init", { log, installDependencies });

	const contents = await fs.readFile(
		path.join(ctx.project.root, "prismicio.js"),
		"utf8",
	);
	const file = parseSourceFile(contents);

	const respositoryName = file.getVariableStatementOrThrow("repositoryName");
	expect(respositoryName.isExported()).toBe(true);

	const routes = file.getVariableStatementOrThrow("routes");
	expect(routes.isExported()).toBe(false);

	const createClient = file.getVariableStatementOrThrow("createClient");
	expect(createClient.isExported()).toBe(true);
});

test("does not overwrite prismicio file if it already exists", async (ctx) => {
	const log = vi.fn();
	const installDependencies = vi.fn();

	const filePath = path.join(ctx.project.root, "prismicio.js");
	const contents = "foo";

	await fs.writeFile(filePath, contents);

	await ctx.pluginRunner.callHook("project:init", { log, installDependencies });

	const postHookContents = await fs.readFile(filePath, "utf8");

	expect(postHookContents).toBe(contents);
});

test("prismicio file is formatted by default", async (ctx) => {
	const log = vi.fn();
	const installDependencies = vi.fn();

	await ctx.pluginRunner.callHook("project:init", { log, installDependencies });

	const contents = await fs.readFile(
		path.join(ctx.project.root, "prismicio.js"),
		"utf8",
	);

	expect(contents).toBe(prettier.format(contents, { parser: "typescript" }));
});

test("prismicio file is not formatted if formatting is disabled", async (ctx) => {
	ctx.project.config.adapter.options.format = false;
	const pluginRunner = createSliceMachinePluginRunner({ project: ctx.project });
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
		prettier.format(contents, {
			...prettierOptions,
			parser: "typescript",
		}),
	);
});

test("creates a prismicio.ts file when TypeScript is enabled", async (ctx) => {
	ctx.project.config.adapter.options.typescript = true;
	const pluginRunner = createSliceMachinePluginRunner({ project: ctx.project });
	await pluginRunner.init();

	const log = vi.fn();
	const installDependencies = vi.fn();

	await pluginRunner.callHook("project:init", { log, installDependencies });

	const contents = await fs.readFile(
		path.join(ctx.project.root, "prismicio.ts"),
		"utf8",
	);
	const file = parseSourceFile(contents);

	const respositoryName = file.getVariableStatementOrThrow("repositoryName");
	expect(respositoryName.isExported()).toBe(true);

	const routes = file.getVariableStatementOrThrow("routes");
	expect(routes.isExported()).toBe(false);

	const createClient = file.getVariableStatementOrThrow("createClient");
	expect(createClient.isExported()).toBe(true);
});

test("creates a prismicio.ts file when TypeScript is detected", async (ctx) => {
	const log = vi.fn();
	const installDependencies = vi.fn();

	await fs.writeFile(
		path.join(ctx.project.root, "tsconfig.json"),
		JSON.stringify({}),
	);

	await ctx.pluginRunner.callHook("project:init", { log, installDependencies });

	const contents = await fs.readFile(
		path.join(ctx.project.root, "prismicio.ts"),
		"utf8",
	);
	const file = parseSourceFile(contents);

	const respositoryName = file.getVariableStatementOrThrow("repositoryName");
	expect(respositoryName.isExported()).toBe(true);

	const routes = file.getVariableStatementOrThrow("routes");
	expect(routes.isExported()).toBe(false);

	const createClient = file.getVariableStatementOrThrow("createClient");
	expect(createClient.isExported()).toBe(true);
});

test("creates a Slice Simulator page file", async (ctx) => {
	const log = vi.fn();
	const installDependencies = vi.fn();

	await ctx.pluginRunner.callHook("project:init", { log, installDependencies });

	const contents = await fs.readFile(
		path.join(ctx.project.root, "pages", "slice-simulator.js"),
		"utf8",
	);
	const file = parseSourceFile(contents, ".jsx");

	expect(
		file
			.getImportDeclarationOrThrow("@slicemachine/adapter-next/simulator")
			.getText(),
	).toBe(
		'import { SliceSimulator } from "@slicemachine/adapter-next/simulator";',
	);
	expect(file.getImportDeclarationOrThrow("@prismicio/react").getText()).toBe(
		'import { SliceZone } from "@prismicio/react";',
	);
	expect(file.getImportDeclarationOrThrow("../slices").getText()).toBe(
		'import { components } from "../slices";',
	);
	expect(file.getVariableStatementOrThrow("SliceSimulatorPage").getText()).toBe(
		`
const SliceSimulatorPage = () => {
  return (
    <SliceSimulator
      sliceZone={(props) => <SliceZone {...props} components={components} />}
    />
  );
};
		`.trim(),
	);
	expect(/^default export SliceSimulatorPage;?$/.test(contents));
});

test("does not overwrite Slice Simulator page file if it already exists", async (ctx) => {
	const log = vi.fn();
	const installDependencies = vi.fn();

	const filePath = path.join(ctx.project.root, "pages", "slice-simulator.js");
	const contents = "foo";

	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await fs.writeFile(filePath, contents);

	await ctx.pluginRunner.callHook("project:init", { log, installDependencies });

	const postHookContents = await fs.readFile(filePath, "utf8");

	expect(postHookContents).toBe(contents);
});

test("creates Slice Simulator page file in the src directory if it exists", async (ctx) => {
	const log = vi.fn();
	const installDependencies = vi.fn();

	await fs.mkdir(path.join(ctx.project.root, "src"));

	await ctx.pluginRunner.callHook("project:init", { log, installDependencies });

	const pagesDir = await fs.readdir(
		path.join(ctx.project.root, "src", "pages"),
	);

	expect(pagesDir).toContain("slice-simulator.js");
});

test("Slice Simulator page file is formatted by default", async (ctx) => {
	const log = vi.fn();
	const installDependencies = vi.fn();

	await ctx.pluginRunner.callHook("project:init", { log, installDependencies });

	const contents = await fs.readFile(
		path.join(ctx.project.root, "pages", "slice-simulator.js"),
		"utf8",
	);

	expect(contents).toBe(prettier.format(contents, { parser: "typescript" }));
});

test("Slice Simulator page file is not formatted if formatting is disabled", async (ctx) => {
	ctx.project.config.adapter.options.format = false;
	const pluginRunner = createSliceMachinePluginRunner({ project: ctx.project });
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
		prettier.format(contents, {
			...prettierOptions,
			parser: "typescript",
		}),
	);
});

test("creates a Slice Simulator TypeScript page file when TypeScript is enabled", async (ctx) => {
	ctx.project.config.adapter.options.typescript = true;
	const pluginRunner = createSliceMachinePluginRunner({
		project: ctx.project,
	});
	await pluginRunner.init();

	const log = vi.fn();
	const installDependencies = vi.fn();

	await pluginRunner.callHook("project:init", { log, installDependencies });

	const contents = await fs.readFile(
		path.join(ctx.project.root, "pages", "slice-simulator.tsx"),
		"utf8",
	);
	const file = parseSourceFile(contents, ".tsx");

	expect(
		file
			.getImportDeclarationOrThrow("@slicemachine/adapter-next/simulator")
			.getText(),
	).toBe(
		'import { SliceSimulator } from "@slicemachine/adapter-next/simulator";',
	);
	expect(file.getImportDeclarationOrThrow("@prismicio/react").getText()).toBe(
		'import { SliceZone } from "@prismicio/react";',
	);
	expect(file.getImportDeclarationOrThrow("../slices").getText()).toBe(
		'import { components } from "../slices";',
	);
	expect(file.getVariableStatementOrThrow("SliceSimulatorPage").getText()).toBe(
		`
const SliceSimulatorPage = () => {
  return (
    <SliceSimulator
      sliceZone={(props) => <SliceZone {...props} components={components} />}
    />
  );
};
		`.trim(),
	);
	expect(/^default export SliceSimulatorPage;?$/.test(contents));
});
