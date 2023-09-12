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
						type: "heading2",
						content: {
							text: "Build a website that keeps getting better",
							spans: [],
						},
						direction: "ltr",
					},
				],
			},
			eyebrowHeadline: {
				__TYPE__: "FieldContent",
				type: "Text",
				value: "Hero",
			},
			description: {
				__TYPE__: "StructuredTextContent",
				value: [
					{
						type: "paragraph",
						content: {
							text: "Learn how prismic.io helps thousands of businesses around the world with some of our customers’ use-cases",
							spans: [],
						},
						direction: "ltr",
					},
				],
			},
			image: {
				url: "https://images.unsplash.com/photo-1584559582128-b8be739912e1?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMzc0NjN8MHwxfHNlYXJjaHw5fHxmcnVpdHxlbnwwfHx8fDE2OTQ0NDI5NzZ8MA&ixlib=rb-4.0.3&q=85",
				origin: {
					id: "h5yMpgOI5nI",
					url: "https://images.unsplash.com/photo-1584559582128-b8be739912e1?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMzc0NjN8MHwxfHNlYXJjaHw5fHxmcnVpdHxlbnwwfHx8fDE2OTQ0NDI5NzZ8MA&ixlib=rb-4.0.3&q=85",
					width: 3710,
					height: 3710,
				},
				width: 3710,
				height: 3710,
				edit: {
					background: "transparent",
					zoom: 1,
					crop: {
						x: 0,
						y: 0,
					},
				},
				credits: null,
				alt: "Image Content",
				__TYPE__: "ImageContent",
				thumbnails: {},
			},
			callToActionLabel: {
				__TYPE__: "FieldContent",
				type: "Text",
				value: "Call to Action",
			},
			callToActionLink: {
				__TYPE__: "LinkContent",
				value: {
					__TYPE__: "ExternalLink",
					url: "https://prismic.io",
					target: "",
				},
			},
		},
		items: [],
	},
	{
		__TYPE__: "SharedSliceContent",
		variation: "imageRight",
		primary: {
			eyebrowHeadline: {
				__TYPE__: "FieldContent",
				type: "Text",
				value: "Image Right",
			},
			title: {
				__TYPE__: "StructuredTextContent",
				value: [
					{
						type: "heading1",
						content: {
							text: "Build a website",
							spans: [],
						},
						direction: "ltr",
					},
				],
			},
			description: {
				__TYPE__: "StructuredTextContent",
				value: [
					{
						type: "paragraph",
						content: {
							text: "Learn how prismic.io helps thousands of businesses around the world with some of our customers’ use-cases, including Image Right slice variations!",
							spans: [],
						},
						direction: "ltr",
					},
					{
						type: "paragraph",
						content: {
							text: "\nBy the way: this RichText field supports multi-paragraph!",
							spans: [],
						},
						direction: "ltr",
					},
				],
			},
			image: {
				origin: {
					id: "euqiHwS38Rw",
					url: "https://images.unsplash.com/photo-1595475207225-428b62bda831?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMzc0NjN8MHwxfHNlYXJjaHwyMHx8ZnJ1aXR8ZW58MHx8fHwxNjk0NDQyOTc2fDA&ixlib=rb-4.0.3&q=85",
					width: 2500,
					height: 2500,
				},
				url: "https://images.unsplash.com/photo-1595475207225-428b62bda831?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMzc0NjN8MHwxfHNlYXJjaHwyMHx8ZnJ1aXR8ZW58MHx8fHwxNjk0NDQyOTc2fDA&ixlib=rb-4.0.3&q=85",
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
				alt: "Image Content",
				__TYPE__: "ImageContent",
				thumbnails: {},
			},
			callToActionLabel: {
				__TYPE__: "FieldContent",
				type: "Text",
				value: "Call to Action",
			},
			callToActionLink: {
				__TYPE__: "LinkContent",
				value: {
					__TYPE__: "ExternalLink",
					url: "https://prismic.io",
					target: "",
				},
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
			import { Content, isFilled } from "@prismicio/client";
			import { PrismicNextLink, PrismicNextImage } from "@prismicio/next";
			import { SliceComponentProps, PrismicRichText } from "@prismicio/react";
			
			/**
			 * Props for \`${pascalName}\`.
			 */
			export type ${pascalName}Props = SliceComponentProps<Content.${pascalName}Slice>;
			
			/**
			 * Component for "${model.name}" Slices.
			 */
			const ${pascalName} = ({ slice }: ${pascalName}Props): JSX.Element => {
				return (
					<section
						data-slice-type={slice.slice_type}
						data-slice-variation={slice.variation}
						className="es-bounded es-fullpage-hero"
					>
						<div
							className={\`
								es-bounded__content
								es-fullpage-hero__content
								\${slice.variation === "imageRight"
									? "es-fullpage-hero__image--right"
									: "es-fullpage-hero__image--left"
								}
							\`}
						>
							<div>
								{isFilled.image(slice.primary.image) && (
									<PrismicNextImage
										field={slice.primary.image}
										className="es-fullpage-hero__image"
									/>
								)}
							</div>
					
							<div className="es-fullpage-hero__content-right">
								<div className="es-fullpage-hero__content__intro">
									{isFilled.keyText(slice.primary.eyebrowHeadline) && (
										<p className="es-fullpage-hero__content__intro__eyebrow">
											{slice.primary.eyebrowHeadline}
										</p>
									)}
									{isFilled.richText(slice.primary.title) && (
										<div className="es-fullpage-hero__content__intro__headline">
											<PrismicRichText field={slice.primary.title} />
										</div>
									)}
									{isFilled.richText(slice.primary.description) && (
										<div className="es-fullpage-hero__content__intro__description">
											<PrismicRichText field={slice.primary.description} />
										</div>
									)}
									{isFilled.link(slice.primary.callToActionLink) && (
										<PrismicNextLink
											className="es-call-to-action__link"
											field={slice.primary.callToActionLink}
										>
											{slice.primary.callToActionLabel || "Learn more…"}
										</PrismicNextLink>
									)}
								</div>
							</div>
						</div>
						<style>
							{\`
						.es-bounded {
							margin: 0px;
							min-width: 0px;
							position: relative;
						}
						
						.es-bounded-content {
							min-width: 0px;
							max-width: 90%;
							margin: 0px auto;
						}
						
						.es-fullpage-hero {
							font-family: system-ui, sans-serif;
							background-color: #fff;
							color: #333;
						}
						
						.es-fullpage-hero__image {
							max-width: 100%;
							height: auto;
							align-self: center;
						}
							
						.es-fullpage-hero__image--left > div:first-child {
							order: 1;
						}
						
						.es-fullpage-hero__image--left > div:nth-child(2) {
							order: 2;
						}
							
						.es-fullpage-hero__image--right > div:first-child {
							order: 2;
						}
						
						.es-fullpage-hero__image--right > div:nth-child(2) {
							order: 1;
						}
						
						.es-fullpage-hero__content {
							display: flex;
							flex-direction: column;
							gap: 2rem;
						}
						
						.es-fullpage-hero__content-right {
							display: flex;
							flex-direction: column;
							justify-content: space-around;
							padding: 1.5rem;
						}
						
						@media (min-width: 1080px) {
							.es-fullpage-hero__content {
								flex-direction: row;
							}
							
							.es-fullpage-hero__content > div {
								width: 50%;
							}
						}
						
						.es-fullpage-hero__content-right__intro {
							margin-top: -2rem;
							display: grid;
							gap: 0.5rem;
						}
						
						.es-fullpage-hero__content__intro {
							display: grid;
							gap: 1rem;
						}
						
						.es-fullpage-hero__content__intro__eyebrow {
							color: #47C1AF;
							font-size: 1.15rem;
							font-weight: 500;
							margin: 0;
						}
						
						.es-fullpage-hero__content__intro__headline {
							font-size: 1.625rem;
							font-weight: 700;
						}
						
						.es-fullpage-hero__content__intro__headline > * {
							margin: 0;
						}
						
						@media (min-width: 640px) {
							.es-fullpage-hero__content__intro__headline {
								font-size: 2rem;
							}
						}
						
						@media (min-width: 1024px) {
							.es-fullpage-hero__content__intro__headline {
								font-size: 2.5rem;
							}
						}
						
						@media (min-width: 1200px) {
							.es-fullpage-hero__content__intro__headline {
								font-size: 2.75rem;
							}
						}
						
						.es-fullpage-hero__content__intro__description {
							font-size: 1.15rem;
							max-width: 38rem;
						}
						
						.es-fullpage-hero__content__intro__description > p {
							margin: 0;
						}
						
						@media (min-width: 1200px) {
							.es-fullpage-hero__content__intro__description {
								font-size: 1.4rem;
							}
						}
						
						.es-fullpage-hero__content__items {
							display: grid;
							gap: 2rem;
						}
						
						@media (min-width: 640px) {
							.es-fullpage-hero__content__items {
								grid-template-columns: repeat(2, 1fr);
							}
						}
						
						.es-fullpage-hero__item {
							display: grid;
							align-content: start;
						}
						
						.es-fullpage-hero__item__icon {
							max-height: 3rem;
						}
						
						.es-fullpage-hero__item__heading {
							font-weight: 700;
							font-size: 1.17rem;
							margin-top: 0;
							margin-bottom: .5rem;
						}

						.es-fullpage-hero__item__heading > * {
							margin: 0;
						}
						
						.es-fullpage-hero__item__description {
							font-size: 0.9rem;
						}
						
						.es-fullpage-hero__item__description > * {
							margin: 0;
						}

						.es-call-to-action__link {
							justify-self: flex-start;
							border-radius: 0.25rem;
							font-size: 0.875rem;
							line-height: 1.3;
							padding: 1rem 2.625rem;
							transition: background-color 100ms linear;
							background-color: #16745f;
							color: #fff;
						}
						
						.es-call-to-action__link:hover {
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
		import { isFilled } from "@prismicio/client";
		import { PrismicNextLink, PrismicNextImage } from "@prismicio/next";
		import { PrismicRichText } from "@prismicio/react";
		
		/**
		 * @typedef {import("@prismicio/client").Content.${pascalName}Slice} ${pascalName}Slice
		 * @typedef {import("@prismicio/react").SliceComponentProps<${pascalName}Slice>} ${pascalName}Props
		 * @param {${pascalName}Props}
		 */
		const ${pascalName} = ({ slice }) => {
			return (
				<section
					data-slice-type={slice.slice_type}
					data-slice-variation={slice.variation}
					className="es-bounded es-fullpage-hero"
				>
					<div
						className={\`
							es-bounded__content
							es-fullpage-hero__content
							\${slice.variation === "imageRight"
								? "es-fullpage-hero__image--right"
								: "es-fullpage-hero__image--left"
							}
						\`}
					>
						<div>
							{isFilled.image(slice.primary.image) && (
								<PrismicNextImage
									field={slice.primary.image}
									className="es-fullpage-hero__image"
								/>
							)}
						</div>
				
						<div className="es-fullpage-hero__content-right">
							<div className="es-fullpage-hero__content__intro">
								{isFilled.keyText(slice.primary.eyebrowHeadline) && (
									<p className="es-fullpage-hero__content__intro__eyebrow">
										{slice.primary.eyebrowHeadline}
									</p>
								)}
								{isFilled.richText(slice.primary.title) && (
									<div className="es-fullpage-hero__content__intro__headline">
										<PrismicRichText field={slice.primary.title} />
									</div>
								)}
								{isFilled.richText(slice.primary.description) && (
									<div className="es-fullpage-hero__content__intro__description">
										<PrismicRichText field={slice.primary.description} />
									</div>
								)}
								{isFilled.link(slice.primary.callToActionLink) && (
									<PrismicNextLink
										className="es-call-to-action__link"
										field={slice.primary.callToActionLink}
									>
										{slice.primary.callToActionLabel || "Learn more…"}
									</PrismicNextLink>
								)}
							</div>
						</div>
					</div>
					<style>
						{\`
					.es-bounded {
						margin: 0px;
						min-width: 0px;
						position: relative;
					}
			
					.es-bounded-content {
						min-width: 0px;
						max-width: 90%;
						margin: 0px auto;
					}
			
					.es-fullpage-hero {
						font-family: system-ui, sans-serif;
						background-color: #fff;
						color: #333;
					}
					
					.es-fullpage-hero__image {
						max-width: 100%;
						height: auto;
						align-self: center;
					}
						
					.es-fullpage-hero__image--left > div:first-child {
						order: 1;
					}

					.es-fullpage-hero__image--left > div:nth-child(2) {
						order: 2;
					}
					
					.es-fullpage-hero__image--right > div:first-child {
						order: 2;
					}

					.es-fullpage-hero__image--right > div:nth-child(2) {
						order: 1;
					}
					
					.es-fullpage-hero__content {
						display: flex;
						flex-direction: column;
						gap: 2rem;
					}
					
					.es-fullpage-hero__content-right {
						display: flex;
						flex-direction: column;
						justify-content: space-around;
						padding: 1.5rem;
					}
			
					@media (min-width: 1080px) {
						.es-fullpage-hero__content {
							flex-direction: row;
						}

						.es-fullpage-hero__content > div {
							width: 50%;
						}
					}
						
					.es-fullpage-hero__content-right__intro {
						margin-top: -2rem;
						display: grid;
						gap: 0.5rem;
					}
			
					.es-fullpage-hero__content__intro {
						display: grid;
						gap: 1rem;
					}
						
					.es-fullpage-hero__content__intro__eyebrow {
						color: #47C1AF;
						font-size: 1.15rem;
						font-weight: 500;
						margin: 0;
					}
						
					.es-fullpage-hero__content__intro__headline {
						font-size: 1.625rem;
						font-weight: 700;
					}
			
					.es-fullpage-hero__content__intro__headline > * {
						margin: 0;
					}
						
					@media (min-width: 640px) {
						.es-fullpage-hero__content__intro__headline {
							font-size: 2rem;
						}
					}
						
					@media (min-width: 1024px) {
						.es-fullpage-hero__content__intro__headline {
							font-size: 2.5rem;
						}
					}
						
					@media (min-width: 1200px) {
						.es-fullpage-hero__content__intro__headline {
							font-size: 2.75rem;
						}
					}
						
					.es-fullpage-hero__content__intro__description {
						font-size: 1.15rem;
						max-width: 38rem;
					}
			
					.es-fullpage-hero__content__intro__description > p {
						margin: 0;
					}
						
					@media (min-width: 1200px) {
						.es-fullpage-hero__content__intro__description {
							font-size: 1.4rem;
						}
					}
						
					.es-fullpage-hero__content__items {
						display: grid;
						gap: 2rem;
					}
						
					@media (min-width: 640px) {
						.es-fullpage-hero__content__items {
							grid-template-columns: repeat(2, 1fr);
						}
					}
						
					.es-fullpage-hero__item {
						display: grid;
						align-content: start;
					}
						
					.es-fullpage-hero__item__icon {
						max-height: 3rem;
					}
						
					.es-fullpage-hero__item__heading {
						font-weight: 700;
						font-size: 1.17rem;
						margin-top: 0;
						margin-bottom: .5rem;
					}

					.es-fullpage-hero__item__heading > * {
						margin: 0;
					}
						
					.es-fullpage-hero__item__description {
						font-size: 0.9rem;
					}
						
					.es-fullpage-hero__item__description > * {
						margin: 0;
					}

					.es-call-to-action__link {
						justify-self: flex-start;
						border-radius: 0.25rem;
						font-size: 0.875rem;
						line-height: 1.3;
						padding: 1rem 2.625rem;
						transition: background-color 100ms linear;
						background-color: #16745f;
						color: #fff;
					}
					
					.es-call-to-action__link:hover {
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
	id: "hero",
	type: "SharedSlice",
	name: "Hero",
	description: "Hero",
	variations: [
		{
			id: "default",
			name: "Default",
			docURL: "...",
			version: "initial",
			description: "Default",
			imageUrl: "",
			primary: {
				eyebrowHeadline: {
					type: "Text",
					config: {
						label: "eyebrowHeadline",
						placeholder: "Eyebrow",
					},
				},
				title: {
					type: "StructuredText",
					config: {
						label: "title",
						placeholder: "",
						allowTargetBlank: true,
						single:
							"heading1,heading2,heading3,heading4,heading5,heading6,strong,em",
					},
				},
				description: {
					type: "StructuredText",
					config: {
						label: "description",
						placeholder: "",
						allowTargetBlank: true,
						multi:
							"paragraph,preformatted,hyperlink,embed,rtl,strong,em,list-item,o-list-item",
					},
				},
				image: {
					type: "Image",
					config: {
						label: "image",
						constraint: {},
						thumbnails: [],
					},
				},
				callToActionLabel: {
					type: "Text",
					config: {
						label: "callToActionLabel",
						placeholder: "",
					},
				},
				callToActionLink: {
					type: "Link",
					config: {
						label: "callToActionLink",
						placeholder: "",
						select: null,
					},
				},
			},
			items: {},
		},
		{
			id: "imageRight",
			name: "Image Right",
			docURL: "...",
			version: "initial",
			description: "Default",
			imageUrl: "",
			primary: {
				eyebrowHeadline: {
					type: "Text",
					config: {
						label: "eyebrowHeadline",
						placeholder: "Eyebrow",
					},
				},
				title: {
					type: "StructuredText",
					config: {
						label: "title",
						placeholder: "",
						allowTargetBlank: true,
						single:
							"heading1,heading2,heading3,heading4,heading5,heading6,strong,em",
					},
				},
				description: {
					type: "StructuredText",
					config: {
						label: "description",
						placeholder: "",
						allowTargetBlank: true,
						multi:
							"paragraph,preformatted,hyperlink,embed,rtl,strong,em,list-item,o-list-item",
					},
				},
				image: {
					type: "Image",
					config: {
						label: "image",
						constraint: {},
						thumbnails: [],
					},
				},
				callToActionLabel: {
					type: "Text",
					config: {
						label: "callToActionLabel",
						placeholder: "",
					},
				},
				callToActionLink: {
					type: "Link",
					config: {
						label: "callToActionLink",
						placeholder: "",
						select: null,
					},
				},
			},
			items: {},
		},
	],
};

export const screenshotPaths = {
	default: "Hero/screenshot-default.png",
	imageRight: "Hero/screenshot-imageRight.png",
};
