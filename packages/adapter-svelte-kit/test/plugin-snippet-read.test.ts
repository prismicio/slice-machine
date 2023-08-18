import { it, expect } from "vitest";
import { createMockFactory } from "@prismicio/mock";

/**
 * !!! DO NOT use this mock factory in tests !!!
 *
 * @remarks
 * Its seed is not specific to be used outside the most general cases.
 */
const mock = createMockFactory({ seed: import.meta.url });

// Slice model to be used in general tests.
const model = mock.model.customType({
	fields: {
		boolean: mock.model.boolean(),
		color: mock.model.color(),
		contentRelationship: mock.model.contentRelationship(),
		date: mock.model.date(),
		embed: mock.model.embed(),
		geoPoint: mock.model.geoPoint(),
		group: mock.model.group(),
		image: mock.model.image(),
		integrationFields: mock.model.integrationFields(),
		keyText: mock.model.keyText(),
		link: mock.model.link(),
		linkToMedia: mock.model.linkToMedia(),
		number: mock.model.number(),
		richText: mock.model.richText(),
		select: mock.model.select(),
		sliceZone: mock.model.sliceZone(),
		timestamp: mock.model.timestamp(),
		title: mock.model.title(),
		uid: mock.model.uid(),
	},
});

it("returns no snippets", async (ctx) => {
	for (const fieldName in model.json.Main) {
		const {
			data: [res],
		} = await ctx.pluginRunner.callHook("snippet:read", {
			fieldPath: [model.id, "data", fieldName],
			model: model.json.Main[fieldName as keyof typeof model.json.Main],
		});

		expect(res).toStrictEqual([]);
	}
});
