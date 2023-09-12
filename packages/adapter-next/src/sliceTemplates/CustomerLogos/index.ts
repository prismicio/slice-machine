import type { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { SharedSliceContent } from "@prismicio/types-internal/lib/content";

import { pascalCase } from "../../lib/pascalCase";

import { stripIndent } from "common-tags";

export const mocks: SharedSliceContent[] = [
	{
		__TYPE__: "SharedSliceContent",
		variation: "default",
		primary: {
			callToActionLabel: {
				__TYPE__: "FieldContent",
				type: "Text",
				value: "View customer stories",
			},
			callToActionLink: {
				__TYPE__: "LinkContent",
				value: {
					__TYPE__: "ExternalLink",
					url: "https://prismic.io",
					target: "_blank",
				},
			},
			eyebrowHeadline: {
				__TYPE__: "StructuredTextContent",
				value: [
					{
						type: "heading2",
						content: {
							text: "Trusted by",
							spans: [],
						},
						direction: "ltr",
					},
				],
			},
		},
		items: [
			{
				__TYPE__: "GroupItemContent",
				value: [
					[
						"image",
						{
							origin: {
								id: "main",
								url: "https://images.prismic.io/slicesexamples/95a608cd-8d3c-40c1-a554-0bec1b89eda5_logo-3.svg",
								width: 2545,
								height: 2545,
							},
							url: "https://images.prismic.io/slicesexamples/95a608cd-8d3c-40c1-a554-0bec1b89eda5_logo-3.svg",
							width: 2545,
							height: 2545,
							edit: {
								zoom: 1,
								crop: {
									x: 0,
									y: 0,
								},
								background: "transparent",
							},
							credits: null,
							alt: "Customer Logo",
							__TYPE__: "ImageContent",
							thumbnails: {},
						},
					],
					[
						"link",
						{
							__TYPE__: "LinkContent",
							value: {
								__TYPE__: "ExternalLink",
								url: "http://twitter.com",
							},
						},
					],
				],
			},
			{
				__TYPE__: "GroupItemContent",
				value: [
					[
						"image",
						{
							url: "https://images.prismic.io/slicesexamples/b62a8629-f7f1-4d2e-885a-bd7c6bcff201_logo-2.svg",
							origin: {
								id: "xnRg3xDcNnE",
								url: "https://images.prismic.io/slicesexamples/b62a8629-f7f1-4d2e-885a-bd7c6bcff201_logo-2.svg",
								width: 7173,
								height: 10041,
							},
							width: 7173,
							height: 10041,
							edit: {
								background: "transparent",
								zoom: 1,
								crop: {
									x: 0,
									y: 0,
								},
							},
							credits: null,
							alt: "Customer Logo",
							__TYPE__: "ImageContent",
							thumbnails: {},
						},
					],
					[
						"link",
						{
							__TYPE__: "LinkContent",
							value: {
								__TYPE__: "ExternalLink",
								url: "https://prismic.io",
								target: "_blank",
							},
						},
					],
				],
			},
			{
				__TYPE__: "GroupItemContent",
				value: [
					[
						"image",
						{
							url: "https://images.prismic.io/slicesexamples/4360a72b-bfe4-4144-911c-597146f72c00_logo-5.svg",
							origin: {
								id: "U1iYwZ8Dx7k",
								url: "https://images.prismic.io/slicesexamples/4360a72b-bfe4-4144-911c-597146f72c00_logo-5.svg",
								width: 3337,
								height: 4171,
							},
							width: 3337,
							height: 4171,
							edit: {
								background: "transparent",
								zoom: 1,
								crop: {
									x: 0,
									y: 0,
								},
							},
							credits: null,
							alt: "Customer Logo",
							__TYPE__: "ImageContent",
							thumbnails: {},
						},
					],
					[
						"link",
						{
							__TYPE__: "LinkContent",
							value: {
								__TYPE__: "ExternalLink",
								url: "https://prismic.io",
								target: "",
							},
						},
					],
				],
			},
			{
				__TYPE__: "GroupItemContent",
				value: [
					[
						"image",
						{
							url: "https://images.prismic.io/slicesexamples/846576e2-c93c-40dd-8aaa-b97f4e99e7aa_logo-1.svg",
							origin: {
								id: "nibgG33H0F8",
								url: "https://images.prismic.io/slicesexamples/846576e2-c93c-40dd-8aaa-b97f4e99e7aa_logo-1.svg",
								width: 4000,
								height: 6000,
							},
							width: 4000,
							height: 6000,
							edit: {
								background: "transparent",
								zoom: 1,
								crop: {
									x: 0,
									y: 0,
								},
							},
							credits: null,
							alt: "Customer Logo",
							__TYPE__: "ImageContent",
							thumbnails: {},
						},
					],
					[
						"link",
						{
							__TYPE__: "LinkContent",
							value: {
								__TYPE__: "ExternalLink",
								url: "https://prismic.io",
								target: "",
							},
						},
					],
				],
			},
			{
				__TYPE__: "GroupItemContent",
				value: [
					[
						"image",
						{
							url: "https://images.prismic.io/slicesexamples/23461395-458d-41f5-be25-bac37a4ff53e_logo-6.svg",
							origin: {
								id: "nAOZCYcLND8",
								url: "https://images.prismic.io/slicesexamples/23461395-458d-41f5-be25-bac37a4ff53e_logo-6.svg",
								width: 2749,
								height: 4124,
							},
							width: 2749,
							height: 4124,
							edit: {
								background: "transparent",
								zoom: 1,
								crop: {
									x: 0,
									y: 0,
								},
							},
							credits: null,
							alt: "Customer Logo",
							__TYPE__: "ImageContent",
							thumbnails: {},
						},
					],
					[
						"link",
						{
							__TYPE__: "LinkContent",
							value: {
								__TYPE__: "ExternalLink",
								url: "https://prismic.io",
								target: "",
							},
						},
					],
				],
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
			import { Content, isFilled, asText } from "@prismicio/client";
			import {
				SliceComponentProps,
				PrismicLink,
				PrismicImage,
			} from "@prismicio/react";
			
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
						className="es-bounded es-customer-logos"
					>
						<div className="es-bounded-content es-customer-logos__content">
							{isFilled.richText(slice.primary.eyebrowHeadline) && (
								<h2 className="es-customer-logos__heading">
									{asText(slice.primary.eyebrowHeadline)}
								</h2>
							)}
							{slice.items.length > 0 && (
								<ul className="es-customer-logos__logos">
									{slice.items.map(
										(item) =>
											isFilled.image(item.image) && (
												<li key={item.image.url} className="es-customer-logos__logo">
													<PrismicLink
														field={item.link}
														className="es-customer-logos__link"
													>
														<PrismicImage
															field={item.image}
															height={26}
															width={160}
															className="es-customer-logos__logo__link__image"
														/>
													</PrismicLink>
												</li>
											)
									)}
								</ul>
							)}
							<PrismicLink
								field={slice.primary.callToActionLink}
								className="es-customer-logos__button"
							>
								{slice.primary.callToActionLabel || "Learn more..."}
							</PrismicLink>
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
							font-family: system-ui, sans-serif;
						}

						.es-customer-logos {
							background-color: #f4f0ec;
							color: #333;
						}
						
						.es-customer-logos__content {
							display: grid;
							gap: 2rem;
							justify-items: center;
						}
						
						.es-customer-logos__heading {
							color: #8592e0;
							font-size: 1.5rem;
							font-weight: 500;
							text-align: center;
						}
						
						.es-customer-logos__logos {
							display: grid;
							grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
							grid-column-gap: 1.25rem;
							grid-row-gap: 2rem;
							align-items: center;
							list-style-type: none;
							width: 100%;
						}
						
						@media (min-width: 1200px) {
							.es-customer-logos__logos {
								margin-left: -3rem;
							}
						}
						
						.es-customer-logos__logo {
							margin: 0;
							display: flex;
							justify-content: center;
						}
						
						@media (min-width: 1200px) {
							.es-customer-logos__logo {
								margin-left: 3rem;
							}
						}
						
						.es-customer-logos__logo__link__image {
							max-width: 10rem;
						}
						
						.es-customer-logos__button {
							justify-self: center;
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
		import { isFilled, asText } from "@prismicio/client";
		import { PrismicLink, PrismicImage } from "@prismicio/react";
		
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
					className="es-bounded es-customer-logos"
				>
					<div className="es-bounded-content es-customer-logos__content">
						{isFilled.richText(slice.primary.eyebrowHeadline) && (
							<h2 className="es-customer-logos__heading">
								{asText(slice.primary.eyebrowHeadline)}
							</h2>
						)}
						{slice.items.length > 0 && (
							<ul className="es-customer-logos__logos">
								{slice.items.map(
									(item) =>
										isFilled.image(item.image) && (
											<li key={item.image.url} className="es-customer-logos__logo">
												<PrismicLink
													field={item.link}
													className="es-customer-logos__link"
												>
												<PrismicImage
													field={item.image}
													height={26}
													width={160}
													className="es-customer-logos__logo__link__image"
												/>
												</PrismicLink>
											</li>
										)
								)}
							</ul>
						)}
						<PrismicLink
							field={slice.primary.callToActionLink}
							className="es-customer-logos__button"
						>
							{slice.primary.callToActionLabel || "Learn more..."}
						</PrismicLink>
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
						font-family: system-ui, sans-serif;
					}

					.es-customer-logos {
						background-color: #f4f0ec;
						color: #333;
					}
					
					.es-customer-logos__content {
						display: grid;
						gap: 2rem;
						justify-items: center;
					}
					
					.es-customer-logos__heading {
						color: #8592e0;
						font-size: 1.5rem;
						font-weight: 500;
						text-align: center;
					}
					
					.es-customer-logos__logos {
						display: grid;
						grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
						grid-column-gap: 1.25rem;
						grid-row-gap: 2rem;
						align-items: center;
						list-style-type: none;
						width: 100%;
					}
					
					@media (min-width: 1200px) {
						.es-customer-logos__logos {
							margin-left: -3rem;
						}
					}
					
					.es-customer-logos__logo {
						margin: 0;
						display: flex;
						justify-content: center;
					}
					
					@media (min-width: 1200px) {
						.es-customer-logos__logo {
							margin-left: 3rem;
						}
					}
					
					.es-customer-logos__logo__link__image {
						max-width: 10rem;
					}
					
					.es-customer-logos__button {
						justify-self: center;
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
	id: "customer_logos",
	type: "SharedSlice",
	name: "CustomerLogos",
	description: "CustomerLogos",
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
					type: "StructuredText",
					config: {
						label: "eyebrowHeadline",
						placeholder: "",
						allowTargetBlank: true,
						single: "strong,em,rtl,heading2",
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
			items: {
				image: {
					type: "Image",
					config: {
						label: "image",
						constraint: {},
						thumbnails: [],
					},
				},
				link: {
					type: "Link",
					config: {
						label: "link",
						placeholder: "",
						select: null,
					},
				},
			},
		},
	],
};

export const screenshotPaths = {
	default: "CustomerLogos/screenshot-default.png",
};
