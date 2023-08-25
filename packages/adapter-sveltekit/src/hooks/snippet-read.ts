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
			plugins: ["prettier-plugin-svelte"],
			parser: "svelte",
		},
	});

	return formattedInput;
};

export const snippetRead: SnippetReadHook<PluginOptions> = async (
	data,
	{ helpers },
) => {
	const { fieldPath } = data;

	const label = "Svelte";

	switch (data.model.type) {
		case "StructuredText": {
			return [
				{
					label: `${label} (components)`,
					language: "svelte",
					code: await format(
						stripIndent`
							<PrismicRichText field={${dotPath(fieldPath)}} />
						`,
						helpers,
					),
				},
				{
					label: `${label} (plain text)`,
					language: "svelte",
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
				language: "svelte",
				code: await format(
					stripIndent`
						<PrismicLink field={${dotPath(fieldPath)}}>Link</PrismicLink>
					`,
					helpers,
				),
			};
		}

		case "Image": {
			return {
				label,
				language: "svelte",
				code: await format(
					stripIndent`
							<PrismicImage field={${dotPath(fieldPath)}} />
						`,
					helpers,
				),
			};
		}

		case "Group": {
			const code = await format(
				stripIndent`
					{#each ${dotPath(fieldPath)} as item}
						<!-- Render content for item -->
					{/each}
				`,
				helpers,
			);

			return {
				label,
				language: "svelte",
				code,
			};
		}

		case "Slices": {
			const code = await format(
				stripIndent`
					<SliceZone
					  slices={${dotPath(fieldPath)}}
					  {components}
					/>
				`,
				helpers,
			);

			return {
				label,
				language: "svelte",
				code,
			};
		}

		case "GeoPoint": {
			const code = await format(
				stripIndent`
					{${dotPath(fieldPath, "latitude")}}, {${dotPath(fieldPath, "longitude")}}
				`,
				helpers,
			);

			return {
				label,
				language: "svelte",
				code,
			};
		}

		case "Embed": {
			const code = await format(
				stripIndent`
					{@html ${dotPath(fieldPath, "html")}}
				`,
				helpers,
			);

			return {
				label,
				language: "svelte",
				code,
			};
		}

		default: {
			return {
				label,
				language: "svelte",
				code: await format(
					stripIndent`
						{${dotPath(fieldPath)}}
					`,
					helpers,
				),
			};
		}
	}
};
