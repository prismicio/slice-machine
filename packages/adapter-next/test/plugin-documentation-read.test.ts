import { describe, expect, it } from "vitest";
import { createMockFactory } from "@prismicio/mock";
import * as fs from "node:fs/promises";
import * as path from "node:path";

/**
 * !!! DO NOT use this mock factory in tests !!!
 *
 * @remarks
 * Its seed is not specific to be used outside the most general cases.
 */
const mock = createMockFactory({ seed: import.meta.url });

// Slice model to be used in general tests.
const model = mock.model.customType({
	id: "foo_bar",
	repeatable: true,
});

describe("PageSnippet", () => {
	describe("App Router", () => {
		it("return a snippet with TypeScript for TypeScript projects", async (ctx) => {
			await fs.writeFile(
				path.join(ctx.project.root, "tsconfig.json"),
				JSON.stringify({}),
			);

			const res = await ctx.pluginRunner.callHook("documentation:read", {
				kind: "PageSnippet",
				data: {
					model,
				},
			});

			const item = res.data.flat().find((item) => item.label === "App Router");

			expect(item).toMatchSnapshot();
		});

		it("return a snippet with JavaScript", async (ctx) => {
			const res = await ctx.pluginRunner.callHook("documentation:read", {
				kind: "PageSnippet",
				data: {
					model,
				},
			});

			const item = res.data.flat().find((item) => item.label === "App Router");

			expect(item).toMatchSnapshot();
		});
	});

	describe("Pages Router", () => {
		it("return a snippet with TypeScript for TypeScript projects", async (ctx) => {
			await fs.writeFile(
				path.join(ctx.project.root, "tsconfig.json"),
				JSON.stringify({}),
			);

			const res = await ctx.pluginRunner.callHook("documentation:read", {
				kind: "PageSnippet",
				data: {
					model,
				},
			});

			const item = res.data
				.flat()
				.find((item) => item.label === "Pages Router");

			expect(item).toMatchSnapshot();
		});

		it("return a snippet with JavaScript", async (ctx) => {
			const res = await ctx.pluginRunner.callHook("documentation:read", {
				kind: "PageSnippet",
				data: {
					model,
				},
			});

			const item = res.data
				.flat()
				.find((item) => item.label === "Pages Router");

			expect(item).toMatchSnapshot();
		});
	});
});
