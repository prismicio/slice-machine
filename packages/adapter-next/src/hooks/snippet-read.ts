import type {
	SliceMachineHelpers,
	SnippetReadHook,
} from "@slicemachine/plugin-kit";
import { stripIndent } from "common-tags";

import type { PluginOptions } from "../types";

const dotPath = (...segments: (string | string[])[]): string => {
	return segments.flat().join(".");
};

const format = async (input: string, helpers: SliceMachineHelpers) => {
	const formattedInput = await helpers.format(input, undefined, {
		includeNewlineAtEnd: false,
		prettier: {
			parser: "typescript",
			printWidth: 60,
		},
	});

	return formattedInput.endsWith(";")
		? formattedInput.substring(0, formattedInput.length - 1)
		: formattedInput;
};

export const snippetRead: SnippetReadHook<PluginOptions> = async (
	data,
	{ helpers },
) => {
	const { fieldPath } = data;

	const label = "React";

	switch (data.model.type) {
		case "StructuredText": {
			return [
				{
					label: `${label} (components)`,
					language: "tsx",
					code: await format(
						stripIndent`
							<PrismicRichText field={${dotPath(fieldPath)}} />
						`,
						helpers,
					),
				},
				{
					label: `${label} (plain text)`,
					language: "tsx",
					code: await format(
						stripIndent`
							<PrismicText field={${dotPath(fieldPath)}} />
						`,
						helpers,
					),
				},
			];
		}

		case "Link": {
			return {
				label,
				language: "tsx",
				code: await format(
					stripIndent`
						<PrismicNextLink field={${dotPath(fieldPath)}}>Link</PrismicNextLink>
					`,
					helpers,
				),
			};
		}

		case "Image": {
			return {
				label,
				language: "tsx",
				code: await format(
					stripIndent`
							<PrismicNextImage field={${dotPath(fieldPath)}} />
						`,
					helpers,
				),
			};
		}

		case "Group": {
			const code = await format(
				stripIndent`
					<>
						{${dotPath(fieldPath)}.map((item) => {
							// Render the item
						})}
					</>
				`,
				helpers,
			);

			return {
				label,
				language: "tsx",
				code,
			};
		}

		case "Slices": {
			const code = await format(
				stripIndent`
					<SliceZone
					  slices={${dotPath(fieldPath)}}
					  components={components}
					/>
				`,
				helpers,
			);

			return {
				label,
				language: "tsx",
				code,
			};
		}

		case "GeoPoint": {
			const code = await format(
				stripIndent`
					<>{${dotPath(fieldPath, "latitude")}}, {${dotPath(fieldPath, "longitude")}}</>
				`,
				helpers,
			);

			return {
				label,
				language: "tsx",
				code,
			};
		}

		case "Embed": {
			const code = await format(
				stripIndent`
					<div dangerouslySetInnerHTML={{ __html: ${dotPath(fieldPath, "html")} }} />
				`,
				helpers,
			);

			return {
				label,
				language: "tsx",
				code,
			};
		}

		default: {
			return {
				label,
				language: "tsx",
				code: await format(
					stripIndent`
						<>{${dotPath(fieldPath)}}</>
					`,
					helpers,
				),
			};
		}
	}
};
