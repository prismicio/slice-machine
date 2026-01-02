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
	const { fieldPath, itemName } = data;

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
			const repeat = data.model.config?.repeat ?? false;
			const allowText = data.model.config?.allowText ?? false;

			const allowVariants = Boolean(data.model.config?.variants);
			const variant = (path: string) =>
				allowVariants ? ` :class="${path}.variant"` : "";

			const path = dotPath(fieldPath);

			let codeText;
			if (!repeat && !allowText) {
				codeText = stripIndent`
					<PrismicLink :field="${path}"${variant(path)}>Link</PrismicLink>
				`;
			} else if (!repeat && allowText) {
				codeText = stripIndent`
					<PrismicLink :field="${path}"${variant(path)} />
				`;
			} else if (repeat && !allowText) {
				codeText = stripIndent`
					<template v-for="link in ${path}" :key="link.key">
						<PrismicLink :field="link"${variant("link")}>Link</PrismicLink>
					</template>
				`;
			} else if (repeat && allowText) {
				codeText = stripIndent`
					<template v-for="link in ${path}" :key="link.key">
						<PrismicLink :field="link"${variant("link")} />
					</template>
				`;
			} else {
				throw new Error("Invalid configuration.");
			}

			return {
				label,
				language: "vue",
				code: await format(codeText, helpers),
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

		case "Table": {
			return {
				label,
				language: "vue",
				code: await format(
					stripIndent`
							<PrismicTable :field="${dotPath(fieldPath)}" />
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
							<div v-html="${dotPath(fieldPath)}?.html" />
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
						<template v-for="${itemName} in ${dotPath(fieldPath)}">
							{{ ${itemName} }}
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
