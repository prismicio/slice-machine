import { test, expect } from "vitest";
import { createMockFactory } from "@prismicio/mock";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { expectGlobalContentTypes } from "./__testutils__/expectGlobalContentTypes";

/**
 * !!! DO NOT use this mock factory in tests !!!
 *
 * @remarks
 * Its seed is not specific enough to be used outside the most general cases.
 */
const mock = createMockFactory({ seed: import.meta.url });

// Custom Type model to be used in general tests.
const oldModel = mock.model.customType({
	id: "foo",
	fields: { bar: mock.model.boolean() },
});

// Custom Type model to be used in general tests.
const newModel = mock.model.customType({
	id: "foo",
	fields: { baz: mock.model.boolean() },
});

test("updates model file with new model", async (ctx) => {
	await ctx.pluginRunner.callHook("custom-type:create", { model: oldModel });
	await ctx.pluginRunner.callHook("custom-type:update", { model: newModel });

	expect(
		JSON.parse(
			await fs.readFile(
				path.join(ctx.project.root, "customtypes", newModel.id, "index.json"),
				"utf8",
			),
		),
	).toStrictEqual(newModel);
});

test("global types file contains new model", async (ctx) => {
	await ctx.pluginRunner.callHook("custom-type:create", { model: oldModel });
	await ctx.pluginRunner.callHook("custom-type:update", { model: newModel });

	await expectGlobalContentTypes(ctx, {
		generateTypesConfig: {
			customTypeModels: [newModel],
		},
	});
});
