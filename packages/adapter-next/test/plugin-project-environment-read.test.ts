import { expect, test } from "vitest";
import { createSliceMachinePluginRunner } from "@slicemachine/plugin-kit";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import adapter from "../src";

test("returns the active environment", async (ctx) => {
	await fs.writeFile(
		path.join(ctx.project.root, ".env.local"),
		"NEXT_PUBLIC_PRISMIC_ENVIRONMENT=foo",
	);

	const res = await ctx.pluginRunner.callHook(
		"project:environment:read",
		undefined,
	);

	expect(res.data[0].environment).toBe("foo");
});

test("follows Next.js' env file priority", async (ctx) => {
	await fs.writeFile(
		path.join(ctx.project.root, ".env"),
		"NEXT_PUBLIC_PRISMIC_ENVIRONMENT=root",
	);
	await fs.writeFile(
		path.join(ctx.project.root, ".env.development"),
		"NEXT_PUBLIC_PRISMIC_ENVIRONMENT=development",
	);
	await fs.writeFile(
		path.join(ctx.project.root, ".env.local"),
		"NEXT_PUBLIC_PRISMIC_ENVIRONMENT=local",
	);
	await fs.writeFile(
		path.join(ctx.project.root, ".env.development.local"),
		"NEXT_PUBLIC_PRISMIC_ENVIRONMENT=development.local",
	);

	const res = await ctx.pluginRunner.callHook(
		"project:environment:read",
		undefined,
	);

	expect(res.data[0].environment).toBe("development.local");
});

test("reads from the configured file path", async (ctx) => {
	ctx.project.config.adapter.options.environmentVariableFilePath = ".bar";
	const pluginRunner = createSliceMachinePluginRunner({
		project: ctx.project,
		nativePlugins: {
			[ctx.project.config.adapter.resolve]: adapter,
		},
	});
	await pluginRunner.init();

	await fs.writeFile(
		path.join(ctx.project.root, ".bar"),
		"NEXT_PUBLIC_PRISMIC_ENVIRONMENT=foo",
	);

	const res = await pluginRunner.callHook(
		"project:environment:read",
		undefined,
	);

	expect(res.data[0].environment).toBe("foo");
});

test("returns undefined if the env file does not exist", async (ctx) => {
	const res = await ctx.pluginRunner.callHook(
		"project:environment:read",
		undefined,
	);

	expect(res.data[0].environment).toBe(undefined);
});

test("returns undefined if the env file does not contain the variable", async (ctx) => {
	await fs.writeFile(path.join(ctx.project.root, ".env.local"), "FOO=bar");

	const res = await ctx.pluginRunner.callHook(
		"project:environment:read",
		undefined,
	);

	expect(res.data[0].environment).toBe(undefined);
});
