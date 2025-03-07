import { test, expect } from "vitest";
import { createMockFactory } from "@prismicio/mock";
import { GroupFieldType } from "@prismicio/types-internal/lib/customtypes";
import { Snippet } from "@slicemachine/plugin-kit";
import prettier from "prettier";

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
		integrationFields: mock.model.integration(),
		keyText: mock.model.keyText(),
		link: mock.model.link({ repeat: false, allowText: false }),
		linkToMedia: mock.model.linkToMedia({ allowText: false }),
		number: mock.model.number(),
		richText: mock.model.richText(),
		select: mock.model.select(),
		sliceZone: mock.model.sliceZone(),
		table: mock.model.table(),
		timestamp: mock.model.timestamp(),
		title: mock.model.title(),
		uid: mock.model.uid(),
	},
});

const itemName = "item";

const prettierConfig: prettier.Options = {
	plugins: ["prettier-plugin-svelte"],
	parser: "svelte",
};

const testSnippet = (
	fieldName: keyof typeof model.json.Main,
	expected: string | Snippet[],
) => {
	test(fieldName, async (ctx) => {
		const {
			data: [res],
		} = await ctx.pluginRunner.callHook("snippet:read", {
			fieldPath: [model.id, "data", fieldName],
			model: model.json.Main[fieldName],
			itemName:
				model.json.Main[fieldName].type === GroupFieldType
					? itemName
					: undefined,
		});

		if (Array.isArray(expected)) {
			expect(res).toStrictEqual(
				await Promise.all(
					expected.map(async (descriptor) => ({
						...descriptor,
						code: (await prettier.format(descriptor.code, prettierConfig))
							.replace(/[\r\n]+$/, "")
							.replace(/;$/, ""),
					})),
				),
			);
		} else {
			expect(res).toStrictEqual({
				label: "Svelte",
				language: "svelte",
				code: (await prettier.format(expected, prettierConfig))
					.replace(/[\r\n]+$/, "")
					.replace(/;$/, ""),
			});
		}
	});
};

testSnippet("boolean", `{${model.id}.data.boolean}`);

testSnippet("color", `{${model.id}.data.color}`);

testSnippet(
	"contentRelationship",
	`<PrismicLink field={${model.id}.data.contentRelationship}>Link</PrismicLink>`,
);

testSnippet("date", `{${model.id}.data.date}`);

testSnippet("embed", `{@html ${model.id}.data.embed.html}`);

testSnippet(
	"geoPoint",
	`{${model.id}.data.geoPoint.latitude}, {${model.id}.data.geoPoint.longitude}`,
);

testSnippet(
	"group",
	`{#each ${model.id}.data.group as ${itemName}}
	<!-- Render content for ${itemName} -->
{/each}`,
);

testSnippet("image", `<PrismicImage field={${model.id}.data.image} />`);

testSnippet("integrationFields", `{${model.id}.data.integrationFields}`);

testSnippet("keyText", `{${model.id}.data.keyText}`);

testSnippet(
	"link",
	`<PrismicLink field={${model.id}.data.link}>Link</PrismicLink>`,
);

testSnippet(
	"linkToMedia",
	`<PrismicLink field={${model.id}.data.linkToMedia}>Link</PrismicLink>`,
);

testSnippet("number", `{${model.id}.data.number}`);

testSnippet("richText", [
	{
		label: "Svelte (components)",
		language: "svelte",
		code: `<PrismicRichText field={${model.id}.data.richText} />`,
	},
	{
		label: "Svelte (plain text)",
		language: "svelte",
		code: `<PrismicText field={${model.id}.data.richText} />`,
	},
]);

testSnippet("select", `{${model.id}.data.select}`);

testSnippet(
	"sliceZone",
	`<SliceZone slices={${model.id}.data.sliceZone} {components} />`,
);

testSnippet("table", `<PrismicTable field={${model.id}.data.table} />`);

testSnippet("timestamp", `{${model.id}.data.timestamp}`);

testSnippet("title", [
	{
		label: "Svelte (components)",
		language: "svelte",
		code: `<PrismicRichText field={${model.id}.data.title} />`,
	},
	{
		label: "Svelte (plain text)",
		language: "svelte",
		code: `<PrismicText field={${model.id}.data.title} />`,
	},
]);

testSnippet("uid", `{${model.id}.data.uid}`);
