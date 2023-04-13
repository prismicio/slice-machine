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
			parser: "vue",
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

	const label = "Vue";

	switch (data.model.type) {
		case "StructuredText": {
			return [
				{
					label: `${label} (rich)`,
					language: "vue",
					code: await format(
						stripIndent`
						<PrismicRichText :field="${dotPath(fieldPath)}" />
					`,
						helpers,
					),
				},
				{
					label: `${label} (plain)`,
					language: "vue",
					code: await format(
						stripIndent`
						<PrismicText :field="${dotPath(fieldPath)}" />
					`,
						helpers,
					),
				},
			];
		}

		case "Link": {
			return {
				label,
				language: "vue",
				code: await format(
					stripIndent`
						<PrismicLink :field="${dotPath(fieldPath)}">Link</PrismicLink>
					`,
					helpers,
				),
			};
		}

		case "Image": {
			return {
				label,
				language: "vue",
				code: await format(
					stripIndent`
							<PrismicImage :field="${dotPath(fieldPath)}" />
						`,
					helpers,
				),
			};
		}

		case "Embed": {
			return {
				label,
				language: "vue",
				code: await format(
					stripIndent`
							<PrismicEmbed :field="${dotPath(fieldPath)}" />
						`,
					helpers,
				),
			};
		}

		case "Group": {
			return {
				label,
				language: "vue",
				code: await format(
					stripIndent`
						<template v-for="item in ${dotPath(fieldPath)}">
							{{ item }}
						</template>
					`,
					helpers,
				),
			};
		}

		case "Slices": {
			const code = await format(
				stripIndent`
					<SliceZone
						:slices="${dotPath(fieldPath)}"
						:components="components"
					/>
				`,
				helpers,
			);

			return {
				label,
				language: "vue",
				code,
			};
		}

		default: {
			return {
				label,
				language: "vue",
				code: await format(
					stripIndent`
						{{${dotPath(fieldPath)}}}
					`,
					helpers,
				),
			};
		}
	}
};
