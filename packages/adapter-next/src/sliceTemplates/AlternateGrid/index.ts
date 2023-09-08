import { SharedSliceContent } from "@prismicio/types-internal/lib/content";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { stripIndent } from "common-tags";
import { pascalCase } from "../../lib/pascalCase";

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
							text: "Alternate like a star",
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
							text: "A predesigned AlternateGrid component, that you can use to list your skills or features of a product.",
							spans: [
								{
									type: "strong",
									start: 44,
									end: 47,
								},
							],
						},
						direction: "ltr",
					},
				],
			},
			eyebrowHeadline: {
				__TYPE__: "FieldContent",
				type: "Text",
				value: "Eyebrow",
			},
			image: {
				origin: {
					id: "main",
					url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
					width: 4076,
					height: 2712,
				},
				url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
				width: 4076,
				height: 2712,
				edit: {
					zoom: 1,
					crop: {
						x: 0,
						y: 0,
					},
					background: "transparent",
				},
				credits: null,
				alt: "Image of computer",
				__TYPE__: "ImageContent",
				thumbnails: {},
			},
		},
		items: [
			{
				__TYPE__: "GroupItemContent",
				value: [
					[
						"title",
						{
							__TYPE__: "StructuredTextContent",
							value: [
								{
									type: "heading3",
									content: {
										text: "Integrate with the SliceZone",
										spans: [],
									},
									direction: "ltr",
								},
							],
						},
					],
					[
						"description",
						{
							__TYPE__: "StructuredTextContent",
							value: [
								{
									type: "paragraph",
									content: {
										text: "This component has been matched by the SliceZone. Its model has been fetched from SliceMachine next-adapter!",
										spans: [],
									},
									direction: "ltr",
								},
							],
						},
					],
				],
			},
			{
				__TYPE__: "GroupItemContent",
				value: [
					[
						"title",
						{
							__TYPE__: "StructuredTextContent",
							value: [
								{
									type: "heading3",
									content: {
										text: "Create your own",
										spans: [],
									},
									direction: "ltr",
								},
							],
						},
					],
					[
						"description",
						{
							__TYPE__: "StructuredTextContent",
							value: [
								{
									type: "paragraph",
									content: {
										text: "Feel free to use this component fully, or use it as an example! We're adding templates as often as we can.",
										spans: [],
									},
									direction: "ltr",
								},
							],
						},
					],
				],
			},
			{
				__TYPE__: "GroupItemContent",
				value: [
					[
						"title",
						{
							__TYPE__: "StructuredTextContent",
							value: [
								{
									type: "heading3",
									content: {
										text: "Add a variation",
										spans: [],
									},
									direction: "ltr",
								},
							],
						},
					],
					[
						"description",
						{
							__TYPE__: "StructuredTextContent",
							value: [
								{
									type: "paragraph",
									content: {
										text: 'This slice comes with a "Image Right" variation, which means editors can switch text/image direction!',
										spans: [],
									},
									direction: "ltr",
								},
							],
						},
					],
				],
			},
		],
	},
	{
		__TYPE__: "SharedSliceContent",
		variation: "imageRight",
		primary: {
			eyebrowHeadline: {
				__TYPE__: "FieldContent",
				value: "activity",
				type: "Text",
			},
			title: {
				__TYPE__: "StructuredTextContent",
				value: [
					{
						type: "heading1",
						content: {
							text: "Alternate like a star",
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
							text: "A predesigned AlternateGrid component, that you can use to list your skills or features of a product.",
							spans: [
								{
									type: "strong",
									start: 44,
									end: 47,
								},
							],
						},
						direction: "ltr",
					},
				],
			},
			image: {
				origin: {
					id: "main",
					url: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5",
					width: 5848,
					height: 3899,
				},
				url: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5",
				width: 5848,
				height: 3899,
				edit: {
					zoom: 1,
					crop: {
						x: 0,
						y: 0,
					},
					background: "transparent",
				},
				credits: null,
				alt: "Image of computer",
				__TYPE__: "ImageContent",
				thumbnails: {},
			},
		},
		items: [
			{
				__TYPE__: "GroupItemContent",
				value: [
					[
						"title",
						{
							__TYPE__: "StructuredTextContent",
							value: [
								{
									type: "heading3",
									content: {
										text: "Create a unique, high-performing site",
										spans: [
											{
												type: "strong",
												start: 9,
												end: 15,
											},
										],
									},
									direction: "ltr",
								},
							],
						},
					],
					[
						"description",
						{
							__TYPE__: "StructuredTextContent",
							value: [
								{
									type: "paragraph",
									content: {
										text: "Prismic is the headless website builder designed to help developers and marketers create unique, high-performing websites that are easy to edit.",
										spans: [],
									},
									direction: "ltr",
								},
							],
						},
					],
				],
			},
		],
	},
];

export const model: SharedSlice = {
	id: "alternate_grid",
	type: "SharedSlice",
	name: "AlternateGrid",
	description: "AlternateGrid",
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
			},
			items: {
				title: {
					type: "StructuredText",
					config: {
						label: "title",
						placeholder: "",
						allowTargetBlank: true,
						single: "heading2,heading3,heading4,heading5,heading6,strong,em",
					},
				},
				description: {
					type: "StructuredText",
					config: {
						label: "description",
						placeholder: "",
						allowTargetBlank: true,
						multi:
							"paragraph,preformatted,hyperlink,strong,em,list-item,o-list-item,rtl",
					},
				},
			},
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
			},
			items: {
				title: {
					type: "StructuredText",
					config: {
						label: "title",
						placeholder: "",
						allowTargetBlank: true,
						single: "heading2,heading3,heading4,heading5,heading6,strong,em",
					},
				},
				description: {
					type: "StructuredText",
					config: {
						label: "description",
						placeholder: "",
						allowTargetBlank: true,
						multi:
							"paragraph,preformatted,hyperlink,strong,em,list-item,o-list-item,rtl",
					},
				},
			},
		},
	],
};

export const screenshotPaths = {
	default: "AlternateGrid/screenshot-default.png",
	imageRight: "AlternateGrid/screenshot-imageRight.png",
};

export const createComponentContents = (
	model: SharedSlice,
	isTypeScriptProject: boolean,
): string => {
	const pascalName = pascalCase(model.name);
	if (isTypeScriptProject) {
		return stripIndent`
            import { Content, isFilled } from "@prismicio/client";
            import {
            SliceComponentProps,
            PrismicRichText,
            PrismicImage,
            } from "@prismicio/react";
            
            export type ${pascalName}Props = SliceComponentProps<Content.${pascalName}Slice>;
            
            const ${pascalName} = ({ slice }: ${pascalName}Props): JSX.Element => {
				return (
					<section
						data-slice-type={slice.slice_type}
						data-slice-variation={slice.variation}
						className="essential-slice es-bounded es-alternate-grid"
					>
					<div
						className={\`
							es-bounded__content
							es-alternate-grid__content
							\${isFilled.image(slice.primary.image) ? "es-alternate-grid__content--with-image" : ""}
						\`}
					>
						{isFilled.image(slice.primary.image) && (
							<PrismicImage
								field={slice.primary.image}
								className={\`
									es-alternate-grid__image
									\${
										slice.variation === "imageRight"
										? "es-alternate-grid__image--right"
										: "es-alternate-grid__image--left"
									}
								\`}
							/>
						)}
						<div className="es-alternate-grid__primary-content">
							<div className="es-alternate-grid__primary-content__intro">
								{isFilled.keyText(slice.primary.eyebrowHeadline) && (
									<p className="es-alternate-grid__primary-content__intro__eyebrow">
										{slice.primary.eyebrowHeadline}
									</p>
								)}
								{isFilled.richText(slice.primary.title) && (
									<div className="es-alternate-grid__primary-content__intro__headline">
										<PrismicRichText field={slice.primary.title} />
									</div>
								)}
								{isFilled.richText(slice.primary.description) && (
									<div className="es-alternate-grid__primary-content__intro__description">
										<PrismicRichText field={slice.primary.description} />
									</div>
								)}
							</div>
							{slice.items.length > 0 && (
								<div className="es-alternate-grid__primary-content__items">
								{slice.items.map((item, i) => (
									<div key={\`item-\${i + 1}\`} className="es-alternate-grid__item">
									{isFilled.richText(item.title) && (
										<div className="es-alternate-grid__item__heading">
											<PrismicRichText field={item.title} />
										</div>
									)}
									{isFilled.richText(item.description) && (
										<div className="es-alternate-grid__item__description">
											<PrismicRichText field={item.description} />
										</div>
									)}
									</div>
								))}
								</div>
							)}
							</div>
						</div>
					
						<style>
							{\`
								.es-bounded {
									margin: 0px;
									min-width: 0px;
									position: relative;
									padding: 8vw 1.25rem;
								}
								.es-bounded-content {
									min-width: 0px;
									max-width: 90%;
									margin: 0px auto;
								}
								.es-alternate-grid {
									font-family: system-ui, sans-serif;
									background-color: #fff;
									color: #333;
								}
								
								.es-alternate-grid__content {
									display: grid;
									gap: 1.5rem;
									grid-auto-flow: dense;
								}
								
								@media (min-width: 640px) {
								.es-alternate-grid__content--with-image {
									grid-template-columns: repeat(2, 1fr);
								}
								}
								
								@media (min-width: 1200px) {
								.es-alternate-grid__content--with-image {
									grid-template-columns: repeat(2, 1fr);
								}
								}
								
								.es-alternate-grid__image {
									width: auto;
									height: auto;
									max-width: 100%;
									align-self: center;
								}
								
								.es-alternate-grid__image--left {
									grid-column: 1;
								}
								
								.es-alternate-grid__image--right {
									grid-column: 2;
								}
								
								.es-alternate-grid__primary-content {
									display: grid;
									gap: 2rem;
								}
								
								.es-alternate-grid__primary-content__intro {
									display: grid;
									gap: 0.5rem;
								}
								
								.es-alternate-grid__primary-content__intro__eyebrow {
									color: #8592e0;
									font-size: 1.15rem;
									font-weight: 500;
									margin: 0;
								}
								
								.es-alternate-grid__primary-content__intro__headline {
									font-size: 1.625rem;
									font-weight: 700;
								}
					
								.es-alternate-grid__primary-content__intro__headline > * {
									margin: 0;
								}
								
								@media (min-width: 640px) {
									.es-alternate-grid__primary-content__intro__headline {
										font-size: 2rem;
									}
								}
								
								@media (min-width: 1024px) {
									.es-alternate-grid__primary-content__intro__headline {
										font-size: 2.5rem;
									}
								}
								
								@media (min-width: 1200px) {
									.es-alternate-grid__primary-content__intro__headline {
										font-size: 2.75rem;
									}
								}
								
								.es-alternate-grid__primary-content__intro__description {
									font-size: 1.15rem;
									max-width: 38rem;
								}
					
								.es-alternate-grid__primary-content__intro__description > p {
									margin: 0;
								}
								
								@media (min-width: 1200px) {
									.es-alternate-grid__primary-content__intro__description {
										font-size: 1.4rem;
									}
								}
								
								.es-alternate-grid__primary-content__items {
									display: grid;
									gap: 2rem;
								}
								
								@media (min-width: 640px) {
									.es-alternate-grid__primary-content__items {
										grid-template-columns: repeat(2, 1fr);
									}
								}
								
								.es-alternate-grid__item {
									display: grid;
									align-content: start;
								}
								
								.es-alternate-grid__item__icon {
									max-height: 3rem;
								}
								
								.es-alternate-grid__item__heading {
									font-weight: 700;
									font-size: 1.17rem;
									margin-top: 0;
									margin-bottom: .5rem;
								}
								.es-alternate-grid__item__heading > * {
									margin: 0;
								}
								
								.es-alternate-grid__item__description {
									font-size: 0.9rem;
								}
								
								.es-alternate-grid__item__description > * {
									margin: 0;
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
		import {
			PrismicRichText,
			PrismicImage,
		} from "@prismicio/react";
		
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
					className="essential-slice es-bounded es-alternate-grid"
				>
				<div
					className={\`
						es-bounded__content
						es-alternate-grid__content
						\${isFilled.image(slice.primary.image) ? "es-alternate-grid__content--with-image" : ""}
					\`}
				>
					{isFilled.image(slice.primary.image) && (
						<PrismicImage
							field={slice.primary.image}
							className={\`
								es-alternate-grid__image
								\${
									slice.variation === "imageRight"
									? "es-alternate-grid__image--right"
									: "es-alternate-grid__image--left"
								}
							\`}
						/>
					)}
					<div className="es-alternate-grid__primary-content">
						<div className="es-alternate-grid__primary-content__intro">
							{isFilled.keyText(slice.primary.eyebrowHeadline) && (
								<p className="es-alternate-grid__primary-content__intro__eyebrow">
									{slice.primary.eyebrowHeadline}
								</p>
							)}
							{isFilled.richText(slice.primary.title) && (
								<div className="es-alternate-grid__primary-content__intro__headline">
									<PrismicRichText field={slice.primary.title} />
								</div>
							)}
							{isFilled.richText(slice.primary.description) && (
								<div className="es-alternate-grid__primary-content__intro__description">
									<PrismicRichText field={slice.primary.description} />
								</div>
							)}
						</div>
						{slice.items.length > 0 && (
							<div className="es-alternate-grid__primary-content__items">
								{slice.items.map((item, i) => (
									<div key={\`item-\${i + 1}\`} className="es-alternate-grid__item">
									{isFilled.richText(item.title) && (
										<div className="es-alternate-grid__item__heading">
											<PrismicRichText field={item.title} />
										</div>
									)}
									{isFilled.richText(item.description) && (
										<div className="es-alternate-grid__item__description">
											<PrismicRichText field={item.description} />
										</div>
									)}
									</div>
								))}
							</div>
						)}
						</div>
					</div>
				
					<style>
						{\`
							.es-bounded {
								margin: 0px;
								min-width: 0px;
								position: relative;
								padding: 8vw 1.25rem;
							}
							.es-bounded-content {
								min-width: 0px;
								max-width: 90%;
								margin: 0px auto;
							}
							.es-alternate-grid {
								font-family: system-ui, sans-serif;
								background-color: #fff;
								color: #333;
							}
							
							.es-alternate-grid__content {
								display: grid;
								gap: 1.5rem;
								grid-auto-flow: dense;
							}
							
							@media (min-width: 640px) {
								.es-alternate-grid__content--with-image {
									grid-template-columns: repeat(2, 1fr);
								}
							}
							
							@media (min-width: 1200px) {
								.es-alternate-grid__content--with-image {
									grid-template-columns: repeat(2, 1fr);
								}
							}
							
							.es-alternate-grid__image {
								max-width: 100%;
								align-self: center;
							}
							
							.es-alternate-grid__image--left {
								grid-column: 1;
							}
							
							.es-alternate-grid__image--right {
							grid-column: 2;
							}
							
							.es-alternate-grid__primary-content {
								display: grid;
								gap: 2rem;
							}
							
							.es-alternate-grid__primary-content__intro {
								display: grid;
								gap: 0.5rem;
							}
							
							.es-alternate-grid__primary-content__intro__eyebrow {
								color: #8592e0;
								font-size: 1.15rem;
								font-weight: 500;
								margin: 0;
							}
							
							.es-alternate-grid__primary-content__intro__headline {
								font-size: 1.625rem;
								font-weight: 700;
							}
				
							.es-alternate-grid__primary-content__intro__headline > * {
								margin: 0;
							}
							
							@media (min-width: 640px) {
								.es-alternate-grid__primary-content__intro__headline {
									font-size: 2rem;
								}
							}
							
							@media (min-width: 1024px) {
								.es-alternate-grid__primary-content__intro__headline {
									font-size: 2.5rem;
								}
							}
							
							@media (min-width: 1200px) {
								.es-alternate-grid__primary-content__intro__headline {
									font-size: 2.75rem;
								}
							}
							
							.es-alternate-grid__primary-content__intro__description {
								font-size: 1.15rem;
								max-width: 38rem;
							}
				
							.es-alternate-grid__primary-content__intro__description > p {
								margin: 0;
							}
							
							@media (min-width: 1200px) {
								.es-alternate-grid__primary-content__intro__description {
									font-size: 1.4rem;
								}
							}
							
							.es-alternate-grid__primary-content__items {
								display: grid;
								gap: 2rem;
							}
							
							@media (min-width: 640px) {
								.es-alternate-grid__primary-content__items {
									grid-template-columns: repeat(2, 1fr);
								}
							}
							
							.es-alternate-grid__item {
								display: grid;
								align-content: start;
							}
							
							.es-alternate-grid__item__icon {
								max-height: 3rem;
							}
							
							.es-alternate-grid__item__heading {
								font-weight: 700;
								font-size: 1.17rem;
								margin-top: 0;
								margin-bottom: .5rem;
							}
							.es-alternate-grid__item__heading > * {
								margin: 0;
							}
							
							.es-alternate-grid__item__description {
								font-size: 0.9rem;
							}
							
							.es-alternate-grid__item__description > * {
								margin: 0;
							}
				
						\`}
					</style>
				</section>
			);
		};
		
		export default ${pascalName};
	
	`;
};
