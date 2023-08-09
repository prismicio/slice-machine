import { expect, it } from "vitest";
import { createMockFactory } from "@prismicio/mock";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { writeCustomTypeModel, renameCustomType } from "../../src/fs";

/**
 * !!! DO NOT use this mock factory in tests !!!
 *
 * @remarks
 * Its seed is not specific to be used outside the most general cases.
 */
const mock = createMockFactory({ seed: import.meta.url });
const model = mock.model.customType();
model.id = "foo_bar";

it("renames a custom type", async (ctx) => {
	await writeCustomTypeModel({
		model,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const preModelContents = JSON.parse(
		await fs.readFile(
			path.join(ctx.project.root, "customtypes", model.id, "index.json"),
			"utf8",
		),
	);

	expect(preModelContents).toStrictEqual(model);

	await renameCustomType({
		model: {
			...model,
			label: "Edited",
		},
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const postModelContents = JSON.parse(
		await fs.readFile(
			path.join(ctx.project.root, "customtypes", model.id, "index.json"),
			"utf8",
		),
	);

	expect(postModelContents).toStrictEqual({
		...model,
		label: "Edited",
	});
});
