import type {
	SliceMachineHelpers,
	SnippetReadHook,
} from "@slicemachine/plugin-kit";
import { stripIndent } from "common-tags";

import type { PluginOptions } from "../types";

const dotPath = (segments: string[]): string => {
	return segments.join(".");
};

const format = async (input: string, helpers: SliceMachineHelpers) => {
	const formattedInput = await helpers.format(input, undefined, {
		includeNewlineAtEnd: false,
		prettier: {
			parser: "typescript",
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
			return {
				label,
				language: "tsx",
				code: await format(
					stripIndent`
						<PrismicRichText field={${dotPath(fieldPath)}} />
					`,
					helpers,
				),
			};
		}

		case "Link": {
			return {
				label,
				language: "tsx",
				code: await format(
					stripIndent`
						<PrismicLink field={${dotPath(fieldPath)}}>Link</PrismicLink>
					`,
					helpers,
				),
			};
		}

		case "Image": {
			return [
				{
					label: `${label} (next/image)`,
					language: "tsx",
					code: await format(
						stripIndent`
							<PrismicNextImage field={${dotPath(fieldPath)}} />
						`,
						helpers,
					),
				},
				{
					label,
					language: "tsx",
					code: await format(
						stripIndent`
							<PrismicImage field={${dotPath(fieldPath)}} />
						`,
						helpers,
					),
				},
			];
		}

		case "Group": {
			const code = await format(
				stripIndent`
					<>{${dotPath(fieldPath)}.map(item => (
					  <>{/* Render content for item */}</>
					))}</>
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

		case "GeoPoint":
		case "Embed": {
			const code = await format(
				stripIndent`
					<>{JSON.stringify(${dotPath(fieldPath)})}</>
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
