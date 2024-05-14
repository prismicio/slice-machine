import type { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { SharedSliceContent } from "@prismicio/types-internal/lib/content";

export const screenshotPaths = {
	default: "CustomerLogos/screenshot-default.png",
};

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
			logos: {
				__TYPE__: "GroupContentType",
				value: [
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
		},
		items: [],
	},
];

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
				logos: {
					type: "Group",
					config: {
						label: "logos",
						fields: {
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
				},
			},
		},
	],
};
