import { SharedSliceContent } from "@prismicio/types-internal/lib/content";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";

export const screenshotPaths = {
	default: "AlternateGrid/screenshot-default.png",
	imageRight: "AlternateGrid/screenshot-imageRight.png",
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
			items: {
				__TYPE__: "GroupContentType",
				value: [
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
		},
		items: [],
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
			items: {
				__TYPE__: "GroupContentType",
				value: [
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
		},
		items: [],
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
				items: {
					type: "Group",
					config: {
						label: "items",
						fields: {
							title: {
								type: "StructuredText",
								config: {
									label: "title",
									placeholder: "",
									allowTargetBlank: true,
									single:
										"heading2,heading3,heading4,heading5,heading6,strong,em",
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
				items: {
					type: "Group",
					config: {
						label: "items",
						fields: {
							title: {
								type: "StructuredText",
								config: {
									label: "title",
									placeholder: "",
									allowTargetBlank: true,
									single:
										"heading2,heading3,heading4,heading5,heading6,strong,em",
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
				},
			},
		},
	],
};
