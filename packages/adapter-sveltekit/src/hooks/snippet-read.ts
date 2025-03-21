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
	const { fieldPath, itemName } = data;

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
			const repeat = data.model.config?.repeat ?? false;
			const allowText = data.model.config?.allowText ?? false;

			const allowVariants = Boolean(data.model.config?.variants);
			const variant = (path: string) =>
				allowVariants ? ` class={${path}.variant}` : "";

			const path = dotPath(fieldPath);

			let codeText;
			if (!repeat && !allowText) {
				codeText = stripIndent`
					<PrismicLink field={${path}}${variant(path)}>Link</PrismicLink>
				`;
			} else if (!repeat && allowText) {
				codeText = stripIndent`
					<PrismicLink field={${path}}${variant(path)} />
				`;
			} else if (repeat && !allowText) {
				codeText = stripIndent`
					{#each ${path} as link (link.key)}
						<PrismicLink field={link}${variant("link")}>Link</PrismicLink>
					{/each}
				`;
			} else if (repeat && allowText) {
				codeText = stripIndent`
					{#each ${path} as link (link.key)}
						<PrismicLink field={link}${variant("link")} />
					{/each}
				`;
			} else {
				throw new Error("Invalid configuration.");
			}

			return {
				label,
				language: "svelte",
				code: await format(codeText, helpers),
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

		case "Table": {
			return {
				label,
				language: "svelte",
				code: await format(
					stripIndent`
							<PrismicTable field={${dotPath(fieldPath)}} />
						`,
					helpers,
				),
			};
		}

		case "Group": {
			const code = await format(
				stripIndent`
					{#each ${dotPath(fieldPath)} as ${itemName}}
						<!-- Render content for ${itemName} -->
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
