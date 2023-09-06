import type { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { SharedSliceContent } from "@prismicio/types-internal/lib/content";

import { pascalCase } from "../../lib/pascalCase";

import { stripIndent } from "common-tags";

export const mocks: SharedSliceContent[] = [
	{
		__TYPE__: "SharedSliceContent",
		variation: "default",
		primary: {
			title: {
				__TYPE__: "StructuredTextContent",
				value: [
					{
						type: "heading1",
						content: {
							text: "Collector Slices kit",
							spans: [],
						},
						direction: "ltr",
					},
				],
			},
			paragraph: {
				__TYPE__: "StructuredTextContent",
				value: [
					{
						type: "paragraph",
						content: {
							text: "It’s very easy to create stylish and beautiful prototypes for your future projects, both graphical and dynamic.",
							spans: [],
						},
						direction: "ltr",
					},
				],
			},
			buttonLink: {
				__TYPE__: "LinkContent",
				value: {
					__TYPE__: "ExternalLink",
					url: "https://twitter.com/prismicio",
				},
			},
			buttonlabel: {
				__TYPE__: "FieldContent",
				type: "Text",
				value: "Click here",
			},
			image: {
				origin: {
					id: "9aOswReDKPo",
					url: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMzc0NjN8MHwxfHNlYXJjaHwxOXx8ZnJ1aXR8ZW58MHx8fHwxNjkzMjUxNTMxfDA&ixlib=rb-4.0.3&q=85",
					width: 8040,
					height: 6024,
				},
				url: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMzc0NjN8MHwxfHNlYXJjaHwxOXx8ZnJ1aXR8ZW58MHx8fHwxNjkzMjUxNTMxfDA&ixlib=rb-4.0.3&q=85",
				width: 8040,
				height: 6024,
				edit: {
					background: "transparent",
					zoom: 1,
					crop: {
						x: 0,
						y: 0,
					},
				},
				credits: null,
				alt: null,
				__TYPE__: "ImageContent",
				thumbnails: {},
			},
			buttonLabel: {
				__TYPE__: "FieldContent",
				type: "Text",
				value: "Learn more",
			},
		},
		items: [],
	},
	{
		__TYPE__: "SharedSliceContent",
		variation: "alignLeft",
		primary: {
			image: {
				origin: {
					id: "euqiHwS38Rw",
					url: "https://images.unsplash.com/photo-1595475207225-428b62bda831?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMzc0NjN8MHwxfHNlYXJjaHwyMHx8ZnJ1aXR8ZW58MHx8fHwxNjkzMjUxNTMxfDA&ixlib=rb-4.0.3&q=85",
					width: 2500,
					height: 2500,
				},
				url: "https://images.unsplash.com/photo-1595475207225-428b62bda831?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMzc0NjN8MHwxfHNlYXJjaHwyMHx8ZnJ1aXR8ZW58MHx8fHwxNjkzMjUxNTMxfDA&ixlib=rb-4.0.3&q=85",
				width: 2500,
				height: 2500,
				edit: {
					background: "transparent",
					zoom: 1,
					crop: {
						x: 0,
						y: 0,
					},
				},
				credits: null,
				alt: null,
				__TYPE__: "ImageContent",
				thumbnails: {},
			},
			title: {
				__TYPE__: "StructuredTextContent",
				value: [
					{
						type: "heading1",
						content: {
							text: "Collector Slices kit",
							spans: [],
						},
						direction: "ltr",
					},
				],
			},
			paragraph: {
				__TYPE__: "StructuredTextContent",
				value: [
					{
						type: "paragraph",
						content: {
							text: "It’s very easy to create stylish and beautiful prototypes for your future projects, both graphical and dynamic.",
							spans: [],
						},
						direction: "ltr",
					},
				],
			},
			buttonLink: {
				__TYPE__: "LinkContent",
				value: {
					__TYPE__: "ExternalLink",
					url: "https://prismic.io",
				},
			},
			buttonLabel: {
				__TYPE__: "FieldContent",
				type: "Text",
				value: "Learn more!",
			},
		},
		items: [
			{
				__TYPE__: "GroupItemContent",
				value: [],
			},
		],
	},
];

export const createComponentContents = (
	model: SharedSlice,
	isTypeScriptProject: boolean,
): string => {
	const pascalName = pascalCase(model.name);

	if (isTypeScriptProject) {
		return stripIndent`
			import { PrismicNextLink, PrismicNextImage } from "@prismicio/next";
			import { Content, isFilled, asText } from "@prismicio/client";
			import { SliceComponentProps, PrismicRichText } from "@prismicio/react";
			
			/**
			 * Props for \`${pascalName}\`.
			 */
			export type ${pascalName}Props = SliceComponentProps<Content.${pascalName}Slice>;
			
			/**
			 * Component for "${model.name}" Slices.
			 */
			const ${pascalName} = ({ slice }: ${pascalName}Props): JSX.Element => {
				const alignment = slice.variation === "alignLeft" ? "left" : "center";
			
				return (
					<section
						data-slice-type={slice.slice_type}
						data-slice-variation={slice.variation}
						className="es-bounded es-call-to-action"
					>
						<div className="es-bounded__content es-call-to-action__content">
							{isFilled.image(slice.primary.image) && (
								<PrismicNextImage
									className="es-call-to-action__image"
									field={slice.primary.image}
								/>
							)}
							<div className="es-call-to-action__content">
								{isFilled.richText(slice.primary.title) && (
									<h2 className="es-call-to-action__content__heading">
										{asText(slice.primary.title)}
									</h2>
								)}
								{isFilled.richText(slice.primary.paragraph) && (
									<div className="es-call-to-action__content__paragraph">
										<PrismicRichText field={slice.primary.paragraph} />
									</div>
								)}
							</div>
							{isFilled.link(slice.primary.buttonLink) && (
								<PrismicNextLink
									className="es-call-to-action__button"
									field={slice.primary.buttonLink}
								>
									{slice.primary.buttonLabel || "Learn more…"}
								</PrismicNextLink>
							)}
						</div>
						<style>
							{\`
						.es-call-to-action {
							background-color: #fff;
							color: #333;
							padding: 8vw 2rem;
						}
						
						.es-call-to-action__content {
							display: grid;
							gap: 2rem;
						}
					
						.es-call-to-action__image {
							max-width: 14rem;
							justify-self: \${alignment};
						}
						
						.es-call-to-action__content {
							display: grid;
							gap: 1rem;
							justify-items: \${alignment};
						}
						
						.es-call-to-action__content__heading {
							font-size: 2rem;
							font-weight: 700;
							text-align: \${alignment};
						}
						
						.es-call-to-action__content__paragraph {
							font-size: 1.15rem;
							max-width: 38rem;
							text-align: \${alignment};
						}
						
						.es-call-to-action__button {
							justify-self: \${alignment};
							border-radius: 0.25rem;
							display: inline-block;
							font-size: 0.875rem;
							line-height: 1.3;
							padding: 1rem 2.625rem;
							text-align: \${alignment};
							transition: background-color 100ms linear;
							background-color: #16745f;
							color: #fff;
						}
	
						.es-call-to-action__button:hover {
							background-color: #0d5e4c;
						}
					\`}
						</style>
					</section>
				);
			};
			
			export default ${pascalName};
		`;
	}

	return stripIndent`
			import { PrismicNextLink, PrismicNextImage } from "@prismicio/next";
			import { PrismicRichText } from "@prismicio/react";
			import { isFilled, asText } from "@prismicio/client";
			
			/**
			 * @typedef {import("@prismicio/client").Content.${pascalName}Slice} ${pascalName}Slice
			 * @typedef {import("@prismicio/react").SliceComponentProps<${pascalName}Slice>} ${pascalName}Props
			 * @param {${pascalName}Props}
			 */
			const ${pascalName} = ({ slice }) => {
				const alignment = slice.variation === "alignLeft" ? "left" : "center";
			
				return (
					<section
						data-slice-type={slice.slice_type}
						data-slice-variation={slice.variation}
						className="es-bounded es-call-to-action"
					>
						<div className="es-bounded__content es-call-to-action__content">
							{isFilled.image(slice.primary.image) && (
								<PrismicNextImage
									className="es-call-to-action__image"
									field={slice.primary.image}
								/>
							)}
							<div className="es-call-to-action__content">
								{isFilled.richText(slice.primary.title) && (
									<h2 className="es-call-to-action__content__heading">
										{asText(slice.primary.title)}
									</h2>
								)}
								{isFilled.richText(slice.primary.paragraph) && (
									<div className="es-call-to-action__content__paragraph">
										<PrismicRichText field={slice.primary.paragraph} />
									</div>
								)}
							</div>
							{isFilled.link(slice.primary.buttonLink) && (
								<PrismicNextLink
									className="es-call-to-action__button"
									field={slice.primary.buttonLink}
								>
									{slice.primary.buttonLabel || "Learn more…"}
								</PrismicNextLink>
							)}
						</div>
						<style>
							{\`
						.es-call-to-action {
							background-color: #fff;
							color: #333;
							padding: 8vw 2rem;
						}
						
						.es-call-to-action__content {
							display: grid;
							gap: 2rem;
						}
						
						.es-call-to-action__image {
							max-width: 14rem;
							justify-self: \${alignment};
						}
						
						.es-call-to-action__content {
							display: grid;
							gap: 1rem;
							justify-items: \${alignment};
						}
						
						.es-call-to-action__content__heading {
							font-size: 2rem;
							font-weight: 700;
							text-align: \${alignment};
						}
						
						.es-call-to-action__content__paragraph {
							font-size: 1.15rem;
							max-width: 38rem;
							text-align: \${alignment};
						}
						
						.es-call-to-action__button {
							justify-self: \${alignment};
							border-radius: 0.25rem;
							display: inline-block;
							font-size: 0.875rem;
							line-height: 1.3;
							padding: 1rem 2.625rem;
							text-align: \${alignment};
							transition: background-color 100ms linear;
							background-color: #16745f;
							color: #fff;
						}
			
						.es-call-to-action__button:hover {
							background-color: #0d5e4c;
						}
					\`}
						</style>
					</section>
				);
			};
			
			export default ${pascalName};
		`;
};

export const model: SharedSlice = {
	id: "call_to_action",
	type: "SharedSlice",
	name: "CallToAction",
	description: "CallToAction",
	variations: [
		{
			id: "default",
			name: "Default",
			docURL: "...",
			version: "initial",
			description: "Default",
			imageUrl: "",
			primary: {
				image: {
					type: "Image",
					config: { label: "Image", constraint: {}, thumbnails: [] },
				},
				title: {
					type: "StructuredText",
					config: {
						label: "title",
						placeholder: "",
						allowTargetBlank: true,
						single: "heading1,heading2,heading3,heading4,heading5,heading6",
					},
				},
				paragraph: {
					type: "StructuredText",
					config: {
						label: "paragraph",
						placeholder: "",
						allowTargetBlank: true,
						single:
							"paragraph,preformatted,strong,em,hyperlink,image,embed,list-item,o-list-item,rtl",
					},
				},
				buttonLink: {
					type: "Link",
					config: {
						label: "buttonLink",
						placeholder: "Redirect URL for CTA button",
						allowTargetBlank: true,
						select: null,
					},
				},
				buttonLabel: {
					type: "Text",
					config: {
						label: "buttonLabel",
						placeholder: "Label for CTA button",
					},
				},
			},
			items: {},
		},
		{
			id: "alignLeft",
			name: "AlignLeft",
			docURL: "...",
			version: "initial",
			description: "Default",
			imageUrl: "",
			primary: {
				image: {
					type: "Image",
					config: { label: "Image", constraint: {}, thumbnails: [] },
				},
				title: {
					type: "StructuredText",
					config: {
						label: "title",
						placeholder: "",
						allowTargetBlank: true,
						single: "heading1,heading2,heading3,heading4,heading5,heading6",
					},
				},
				paragraph: {
					type: "StructuredText",
					config: {
						label: "paragraph",
						placeholder: "",
						allowTargetBlank: true,
						single:
							"paragraph,preformatted,strong,em,hyperlink,image,embed,list-item,o-list-item,rtl",
					},
				},
				buttonLink: {
					type: "Link",
					config: {
						label: "buttonLink",
						placeholder: "Redirect URL for CTA button",
						allowTargetBlank: true,
						select: null,
					},
				},
				buttonLabel: {
					type: "Text",
					config: {
						label: "buttonLabel",
						placeholder: "Label for CTA button",
					},
				},
			},
			items: {},
		},
	],
};

export const screenshotPaths = {
	default: "CallToAction/screenshot-default.png",
	alignLeft: "CallToAction/screenshot-alignLeft.png",
};
