import { expect, test } from "vitest";
import { createSliceMachinePluginRunner } from "@slicemachine/plugin-kit";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import adapter from "../src";

test("writes the environment to the default env file", async (ctx) => {
	await ctx.pluginRunner.callHook("project:environment:update", {
		environment: "foo",
	});

	const contents = await fs.readFile(
		path.join(ctx.project.root, ".env.local"),
		"utf8",
	);

	expect(contents).toMatch(/^NEXT_PUBLIC_PRISMIC_ENVIRONMENT=foo$/m);
});

test("writes the environment to the configured env file", async (ctx) => {
	ctx.project.config.adapter.options.environmentVariableFilePath = ".bar";
	const pluginRunner = createSliceMachinePluginRunner({
		project: ctx.project,
		nativePlugins: {
			[ctx.project.config.adapter.resolve]: adapter,
		},
	});
	await pluginRunner.init();

	await pluginRunner.callHook("project:environment:update", {
		environment: "foo",
	});

	const contents = await fs.readFile(
		path.join(ctx.project.root, ".bar"),
		"utf8",
	);

	expect(contents).toMatch(/^NEXT_PUBLIC_PRISMIC_ENVIRONMENT=foo$/m);
});

test("updates the variable if the variable exists", async (ctx) => {
	await fs.writeFile(
		path.join(ctx.project.root, ".env.local"),
		"NEXT_PUBLIC_PRISMIC_ENVIRONMENT=foo",
	);

	await ctx.pluginRunner.callHook("project:environment:update", {
		environment: "bar",
	});

	const contents = await fs.readFile(
		path.join(ctx.project.root, ".env.local"),
		"utf8",
	);

	expect(contents).toMatch(/^NEXT_PUBLIC_PRISMIC_ENVIRONMENT=bar$/m);
});

test("appends the variable if other variables exist", async (ctx) => {
	await fs.writeFile(path.join(ctx.project.root, ".env.local"), "FOO=bar");

	await ctx.pluginRunner.callHook("project:environment:update", {
		environment: "foo",
	});

	const contents = await fs.readFile(
		path.join(ctx.project.root, ".env.local"),
		"utf8",
	);

	expect(contents).toMatch(/^FOO=bar$/m);
	expect(contents).toMatch(/^NEXT_PUBLIC_PRISMIC_ENVIRONMENT=foo$/m);
});

test("removes the variable if the environment is undefined", async (ctx) => {
	await fs.writeFile(
		path.join(ctx.project.root, ".env.local"),
		"NEXT_PUBLIC_PRISMIC_ENVIRONMENT=foo",
	);

	await ctx.pluginRunner.callHook("project:environment:update", {
		environment: undefined,
	});

	const contents = await fs.readFile(
		path.join(ctx.project.root, ".env.local"),
		"utf8",
	);

	expect(contents).not.toMatch(/^NEXT_PUBLIC_PRISMIC_ENVIRONMENT=/m);
});

test("does nothing if the environment is undefined and the env file does not exist", async (ctx) => {
	await ctx.pluginRunner.callHook("project:environment:update", {
		environment: undefined,
	});

	expect(
		fs.access(path.join(ctx.project.root, ".env.local")),
	).rejects.toThrow();
});
