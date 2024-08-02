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

const itemName = "item";

const formatSnippet = async (input: string) => {
	return (
		await prettier.format(input, {
			parser: "typescript",
			printWidth: 60,
		})
	)
		.replace(/[\r\n]+$/, "")
		.replace(/;$/, "");
};

const testSnippet = (
	fieldName: keyof typeof model.json.Main,
	expected: string | Snippet[],
	config: { format?: boolean } = {},
) => {
	const { format = true } = config;

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
						code: format
							? await formatSnippet(descriptor.code)
							: descriptor.code,
					})),
				),
			);
		} else {
			expect(res).toStrictEqual({
				label: "React",
				language: "tsx",
				code: format ? await formatSnippet(expected) : expected,
			});
		}
	});
};

testSnippet("boolean", `{${model.id}.data.boolean}`, { format: false });

testSnippet("color", `{${model.id}.data.color}`, { format: false });

testSnippet(
	"contentRelationship",
	`<PrismicNextLink field={${model.id}.data.contentRelationship}>Link</PrismicNextLink>`,
);

testSnippet("date", `{${model.id}.data.date}`, { format: false });

testSnippet(
	"embed",
	`<div dangerouslySetInnerHTML={{ __html: ${model.id}.data.embed.html }} />`,
);

testSnippet(
	"geoPoint",
	`{${model.id}.data.geoPoint.latitude}, {${model.id}.data.geoPoint.longitude}`,
	{ format: false },
);

testSnippet(
	"group",
	`{${model.id}.data.group.map((${itemName}) => (
  // Render the ${itemName}
))}`,
	{ format: false },
);

testSnippet("image", `<PrismicNextImage field={${model.id}.data.image} />`);

testSnippet("integrationFields", `{${model.id}.data.integrationFields}`, {
	format: false,
});

testSnippet("keyText", `{${model.id}.data.keyText}`, { format: false });

testSnippet(
	"link",
	`<PrismicNextLink field={${model.id}.data.link}>Link</PrismicNextLink>`,
);

testSnippet(
	"linkToMedia",
	`<PrismicNextLink field={${model.id}.data.linkToMedia}>Link</PrismicNextLink>`,
);

testSnippet("number", `{${model.id}.data.number}`, { format: false });

testSnippet("richText", [
	{
		label: "React (components)",
		language: "tsx",
		code: `<PrismicRichText field={${model.id}.data.richText} />`,
	},
	{
		label: "React (plain text)",
		language: "tsx",
		code: `<PrismicText field={${model.id}.data.richText} />`,
	},
]);

testSnippet("select", `{${model.id}.data.select}`, { format: false });

testSnippet(
	"sliceZone",
	`<SliceZone slices={${model.id}.data.sliceZone} components={components} />`,
);

testSnippet("timestamp", `{${model.id}.data.timestamp}`, { format: false });

testSnippet("title", [
	{
		label: "React (components)",
		language: "tsx",
		code: `<PrismicRichText field={${model.id}.data.title} />`,
	},
	{
		label: "React (plain text)",
		language: "tsx",
		code: `<PrismicText field={${model.id}.data.title} />`,
	},
]);

testSnippet("uid", `{${model.id}.data.uid}`, { format: false });
