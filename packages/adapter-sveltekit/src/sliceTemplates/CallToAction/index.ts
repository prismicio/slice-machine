import type { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { SharedSliceContent } from "@prismicio/types-internal/lib/content";

export const screenshotPaths = {
	default: "CallToAction/screenshot-default.png",
	alignLeft: "CallToAction/screenshot-alignLeft.png",
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
				key: "913ae9c8-9a46-4cfe-99a5-31013a6858c4",
				value: {
					__TYPE__: "ExternalLink",
					url: "https://twitter.com/prismicio",
					text: "Learn more",
				},
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
				alt: "Example Image",
				__TYPE__: "ImageContent",
				thumbnails: {},
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
				alt: "Example Image",
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
				key: "9a107a0e-39ef-4f01-a922-0e00f100cc91",
				value: {
					__TYPE__: "ExternalLink",
					url: "https://prismic.io",
					text: "Learn more!",
				},
			},
		},
		items: [],
	},
];

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
						allowText: true,
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
						allowText: true,
					},
				},
			},
			items: {},
		},
	],
};
