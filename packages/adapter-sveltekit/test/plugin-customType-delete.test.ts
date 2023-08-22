import { test, expect } from "vitest";
import { createMockFactory } from "@prismicio/mock";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { testGlobalContentTypes } from "./__testutils__/testGlobalContentTypes";

/**
 * !!! DO NOT use this mock factory in tests !!!
 *
 * @remarks
 * Its seed is not specific enough to be used outside the most general cases.
 */
const mock = createMockFactory({ seed: import.meta.url });

// Custom Type model to be used in general tests.
const model = mock.model.customType({ id: "foo" });

test("deletes the Custom Type directory", async (ctx) => {
	await ctx.pluginRunner.callHook("custom-type:create", { model });

	expect(await fs.readdir(path.join(ctx.project.root, "customtypes"))).includes(
		model.id,
	);

	await ctx.pluginRunner.callHook("custom-type:delete", { model });

	expect(
		await fs.readdir(path.join(ctx.project.root, "customtypes")),
	).not.includes(model.id);
});

testGlobalContentTypes({
	model,
	hookCall: async ({ pluginRunner }) => {
		await pluginRunner.callHook("custom-type:create", { model });
		await pluginRunner.callHook("custom-type:delete", { model });
	},
	generateTypesConfig: {
		customTypeModels: [],
	},
});
