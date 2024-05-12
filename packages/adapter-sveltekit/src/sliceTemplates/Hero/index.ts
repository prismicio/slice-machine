import type { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { SharedSliceContent } from "@prismicio/types-internal/lib/content";

export const screenshotPaths = {
	default: "Hero/screenshot-default.png",
	imageRight: "Hero/screenshot-imageRight.png",
};

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
		items: [],
	},
];

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
