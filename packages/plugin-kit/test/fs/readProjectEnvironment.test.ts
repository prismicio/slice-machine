import { expect, it } from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { readProjectEnvironment } from "../../src/fs";

it("returns the active environment using the given variable name and filenames", async (ctx) => {
	await fs.writeFile(path.join(ctx.project.root, ".env"), "ENV=foo");

	const res = await readProjectEnvironment({
		variableName: "ENV",
		filenames: [".env"],
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toStrictEqual({ environment: "foo" });
});

it("supports custom variable names", async (ctx) => {
	await fs.writeFile(path.join(ctx.project.root, ".env"), "FOO=bar");

	const res = await readProjectEnvironment({
		variableName: "FOO",
		filenames: [".env"],
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toStrictEqual({ environment: "bar" });
});

it("supports custom filenames", async (ctx) => {
	await fs.writeFile(path.join(ctx.project.root, ".env.local"), "FOO=bar");

	const res = await readProjectEnvironment({
		variableName: "FOO",
		filenames: [".env.local"],
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toStrictEqual({ environment: "bar" });
});

it("supports multiple filenames", async (ctx) => {
	await fs.writeFile(path.join(ctx.project.root, ".env"), "FOO=bar");
	await fs.writeFile(path.join(ctx.project.root, ".env.local"), "ENV=foo");

	const res = await readProjectEnvironment({
		variableName: "ENV",
		filenames: [".env", ".env.local"],
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toStrictEqual({ environment: "foo" });
});

it("multiple files are priortized from least to most", async (ctx) => {
	await fs.writeFile(path.join(ctx.project.root, ".env"), "ENV=foo");
	await fs.writeFile(path.join(ctx.project.root, ".env.local"), "ENV=bar");

	const res = await readProjectEnvironment({
		variableName: "ENV",
		filenames: [".env", ".env.local"],
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toStrictEqual({ environment: "bar" });
});

it("ignores non-existent filenames", async (ctx) => {
	await fs.writeFile(path.join(ctx.project.root, ".env"), "ENV=foo");

	// Ensure the file does not exist during the test.
	try {
		await fs.rm(path.join(ctx.project.root, ".env.local"));
	} catch {}

	const res = await readProjectEnvironment({
		variableName: "ENV",
		filenames: [".env", ".env.local"],
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toStrictEqual({ environment: "foo" });
});

it("returns undefined if no filenames are given", async (ctx) => {
	const res = await readProjectEnvironment({
		variableName: "ENV",
		filenames: [],
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toStrictEqual({ environment: undefined });
});

it("returns undefined if the env files do not contain the variable", async (ctx) => {
	await fs.writeFile(path.join(ctx.project.root, ".env"), "FOO=bar");
	await fs.writeFile(path.join(ctx.project.root, ".env.local"), "BAZ=qux");

	const res = await readProjectEnvironment({
		variableName: "ENV",
		filenames: [".env", ".env.local"],
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toStrictEqual({ environment: undefined });
});
