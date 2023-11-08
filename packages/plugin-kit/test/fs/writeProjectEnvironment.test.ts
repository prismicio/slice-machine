import { expect, it } from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { writeProjectEnvironment } from "../../src/fs";

it("writes the given environment to the file as an environment variable", async (ctx) => {
	await writeProjectEnvironment({
		variableName: "FOO",
		environment: "bar",
		filename: ".env",
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const contents = await fs.readFile(
		path.join(ctx.project.root, ".env"),
		"utf8",
	);

	expect(contents).toMatch(/^FOO=bar$/m);
});

it("returns the filename", async (ctx) => {
	const res = await writeProjectEnvironment({
		variableName: "FOO",
		environment: "bar",
		filename: ".env",
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toBe(".env");
});

it("returns undefined if the file does not exist and the environment is undefined", async (ctx) => {
	// Ensure the file does not exist during the test.
	try {
		await fs.rm(path.join(ctx.project.root, ".env"));
	} catch {}

	const res = await writeProjectEnvironment({
		variableName: "FOO",
		environment: undefined,
		filename: ".env",
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toBe(undefined);
});

it("supports custom filenames", async (ctx) => {
	await writeProjectEnvironment({
		variableName: "FOO",
		environment: "bar",
		filename: ".env.local",
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const contents = await fs.readFile(
		path.join(ctx.project.root, ".env.local"),
		"utf8",
	);

	expect(contents).toMatch(/^FOO=bar$/m);
});

it("supports custom variable names", async (ctx) => {
	await writeProjectEnvironment({
		variableName: "BAR",
		environment: "baz",
		filename: ".env",
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const contents = await fs.readFile(
		path.join(ctx.project.root, ".env"),
		"utf8",
	);

	expect(contents).toMatch(/^BAR=baz$/m);
});

it("updates the variable value if the variable exists", async (ctx) => {
	await fs.writeFile(path.join(ctx.project.root, ".env"), "FOO=bar");

	await writeProjectEnvironment({
		variableName: "FOO",
		environment: "baz",
		filename: ".env",
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const contents = await fs.readFile(
		path.join(ctx.project.root, ".env"),
		"utf8",
	);

	expect(contents).toMatch(/^FOO=baz\n$/m);
});

it("updates the variable value if the variable exists and the line starts with \n", async (ctx) => {
	await fs.writeFile(path.join(ctx.project.root, ".env"), "\nFOO=bar");

	await writeProjectEnvironment({
		variableName: "FOO",
		environment: "baz",
		filename: ".env",
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const contents = await fs.readFile(
		path.join(ctx.project.root, ".env"),
		"utf8",
	);

	expect(contents).toMatch(/^FOO=baz\n$/m);
});

it("updates the variable value if the variable exists and the line ends with \n", async (ctx) => {
	await fs.writeFile(path.join(ctx.project.root, ".env"), "FOO=bar\n");

	await writeProjectEnvironment({
		variableName: "FOO",
		environment: "baz",
		filename: ".env",
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const contents = await fs.readFile(
		path.join(ctx.project.root, ".env"),
		"utf8",
	);

	expect(contents).toMatch(/^FOO=baz\n$/m);
});

it("appends the variable if other variables exist", async (ctx) => {
	await fs.writeFile(path.join(ctx.project.root, ".env"), "FOO=bar");

	await writeProjectEnvironment({
		variableName: "BAZ",
		environment: "qux",
		filename: ".env",
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const contents = await fs.readFile(
		path.join(ctx.project.root, ".env"),
		"utf8",
	);

	expect(contents).toMatch(/^FOO=bar$/m);
	expect(contents).toMatch(/^BAZ=qux/m);
});

it("removes the variable if the environment is undefined", async (ctx) => {
	await fs.writeFile(path.join(ctx.project.root, ".env"), "FOO=bar");

	await writeProjectEnvironment({
		variableName: "FOO",
		environment: undefined,
		filename: ".env",
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const contents = await fs.readFile(
		path.join(ctx.project.root, ".env"),
		"utf8",
	);

	expect(contents).not.toMatch(/^FOO=/m);
});

it("does nothing if the environment is undefined and the env file does not exist", async (ctx) => {
	// Ensure the file does not exist during the test.
	try {
		await fs.rm(path.join(ctx.project.root, ".env"));
	} catch {}

	await writeProjectEnvironment({
		variableName: "FOO",
		environment: undefined,
		filename: ".env",
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(fs.access(path.join(ctx.project.root, ".env"))).rejects.toThrow();
});
