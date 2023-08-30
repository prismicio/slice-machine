import { expect, it, vi } from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";

it("formats input with Prettier", async (ctx) => {
	const input = "const foo = 'bar'";

	const consoleWarnSpy = vi
		.spyOn(console, "warn")
		.mockImplementation(() => void 0);

	const res = await ctx.pluginRunner.rawHelpers.format(input, undefined, {
		prettier: { parser: "typescript" },
	});
	expect(res).toBe('const foo = "bar";\n');

	consoleWarnSpy.mockRestore();
});

it("accepts a file path to determine Prettier's parser", async (ctx) => {
	const input = "* List item";
	const filePath = path.join(ctx.project.root, "foo.md");

	const res = await ctx.pluginRunner.rawHelpers.format(input, filePath);
	expect(res).toBe("- List item\n");
});

it("accepts Prettier options", async (ctx) => {
	const input = "const foo = 'bar'";
	const filePath = "foo.js";

	const res = await ctx.pluginRunner.rawHelpers.format(input, filePath, {
		prettier: { semi: false },
	});
	expect(res).toBe('const foo = "bar"\n');
});

it("uses Prettier config file relative to the filepath when it exists", async (ctx) => {
	const input = "const foo = 'bar'";
	const filePath = path.join(ctx.project.root, "foo", "bar", "baz.js");

	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await fs.writeFile(
		path.join(path.dirname(filePath), "..", ".prettierrc"),
		JSON.stringify({ semi: false }),
	);

	const res = await ctx.pluginRunner.rawHelpers.format(input, filePath, {
		prettier: {
			semi: false,
		},
	});

	expect(res).toBe('const foo = "bar"\n');
});

it("removes newline at end of result if `includeNewlineAtEnd` is false", async (ctx) => {
	const input = "* List item";
	const filePath = path.join(ctx.project.root, "foo.md");

	const res = await ctx.pluginRunner.rawHelpers.format(input, filePath, {
		includeNewlineAtEnd: false,
	});
	expect(res).toBe("- List item");
});
