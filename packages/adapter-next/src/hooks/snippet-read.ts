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
	const { fieldPath, itemName } = data;

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
			const repeat = data.model.config?.repeat ?? false;
			const allowText = data.model.config?.allowText ?? false;

			const allowVariants = Boolean(data.model.config?.variants);
			const variant = (path: string, prefix: "" | "\n    " = "") =>
				allowVariants ? `${prefix}className={${path}.variant}` : "";

			const path = dotPath(fieldPath);

			let code;
			if (!repeat && !allowText) {
				code = await format(
					stripIndent`
					<PrismicNextLink field={${path}} ${variant(path)}>Link</PrismicNextLink>
				`,
					helpers,
				);
			} else if (!repeat && allowText) {
				code = await format(
					stripIndent`
					<PrismicNextLink field={${path}} ${variant(path)}/>
				`,
					helpers,
				);
			} else if (repeat && !allowText) {
				// We cannot use `format` since this snippet contains invalid syntax.
				// Please ensure this snippet is manually formatted correctly.
				// Make sure to use spaces instead of tabs.
				code = stripIndent`{${path}.map((link) => (
  <PrismicNextLink
    key={link.key}
    field={link}${variant("link", "\n    ")}>
      Link
  </PrismicNextLink>
))}`;
			} else if (repeat && allowText) {
				// We cannot use `format` since this snippet contains invalid syntax.
				// Please ensure this snippet is manually formatted correctly.
				// Make sure to use spaces instead of tabs.
				code = stripIndent`{${path}.map((link) => (
  <PrismicNextLink
    key={link.key}
    field={link}${variant("link", "\n    ")}
  />
))}`;
			} else {
				throw new Error("Invalid configuration.");
			}

			return {
				label,
				language: "tsx",
				code,
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

		case "Table": {
			return {
				label,
				language: "tsx",
				code: await format(
					stripIndent`
						<PrismicTable field={${dotPath(fieldPath)}} />
					`,
					helpers,
				),
			};
		}

		case "Group": {
			// We cannot use `format` since this snippet contains invalid syntax.
			// Please ensure this snippet is manually formatted correctly.
			const code = stripIndent`
				{${dotPath(fieldPath)}.map((${itemName}) => (
				  // Render the ${itemName}
				))}
			`;

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
			// We cannot use `format` since this snippet contains invalid syntax.
			// Please ensure this snippet is manually formatted correctly.
			const code = stripIndent`
				{${dotPath(fieldPath, "latitude")}}, {${dotPath(fieldPath, "longitude")}}
			`;

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
				// We cannot use `format` since this snippet contains invalid syntax.
				// Please ensure this snippet is manually formatted correctly.
				code: stripIndent`
					{${dotPath(fieldPath)}}
				`,
			};
		}
	}
};
