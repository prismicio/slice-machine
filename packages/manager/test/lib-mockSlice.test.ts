import { describe, test, expect } from "vitest";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";

import { isRight } from "fp-ts/lib/Either";

import {
	GeoPointContent,
	LinkContent,
} from "@prismicio/types-internal/lib/content";
import { SliceComparator } from "@prismicio/types-internal/lib/customtypes/diff";
import { mockSlice } from "../src/lib/mockSlice";

describe("mockSlice", () => {
	test("parse primary", () => {
		const link = {
			"link-2": {
				__TYPE__: "LinkContent",
				value: { url: "http://twitter.com", __TYPE__: "ExternalLink" },
			},
		};
		expect(isRight(LinkContent.decode(link["link-2"]))).toBeTruthy();

		const geo = {
			key: {
				__TYPE__: "GeoPointContent",
				position: { lat: 48.8583736, lng: 2.2922926 },
			},
		};
		const geoR = GeoPointContent.decode(geo.key);

		expect(isRight(geoR)).toBeTruthy();
	});

	test("when creating a slice it should return the default mock", () => {
		const model: SharedSlice = {
			id: "some_slice",
			type: "SharedSlice",
			name: "SomeSlice",
			description: "SomeSlice",
			variations: [
				{
					id: "default",
					name: "Default",
					docURL: "...",
					imageUrl: "",
					version: "sktwi1xtmkfgx8626",
					description: "SomeSlice",
					primary: {
						title: {
							type: "StructuredText",
							config: {
								single: "heading1",
								label: "Title",
								placeholder: "This is where it all begins...",
							},
						},
						description: {
							type: "StructuredText",
							config: {
								single: "paragraph",
								label: "Description",
								placeholder: "A nice description of your product",
							},
						},
					},
				},
			],
		};

		const result = mockSlice({ model });

		expect(result[0].primary).toHaveProperty(
			"title",
			expect.objectContaining({
				__TYPE__: "StructuredTextContent",
				value: [{ type: "heading1", content: { text: expect.any(String) } }],
			}),
		);
		expect(result[0].primary).toHaveProperty(
			"description",
			expect.objectContaining({
				__TYPE__: "StructuredTextContent",
				value: [{ type: "paragraph", content: { text: expect.any(String) } }],
			}),
		);
		// TODO: check the codec we use for SharedSliceContent[]
		// const decoded = SliceMock.decode(result);
		// expect(isRight(decoded)).toBeTruthy();
		// needs to be readable by core/mocks/models SliceMock
	});

	test("when updating a mock it should append new value to existing mock", () => {
		const model: SharedSlice = {
			id: "some_slice",
			type: "SharedSlice",
			name: "SomeSlice",
			description: "SomeSlice",
			variations: [
				{
					id: "default",
					name: "Default",
					docURL: "...",
					imageUrl: "",
					version: "sktwi1xtmkfgx8626",
					description: "SomeSlice",
					primary: {
						title: {
							type: "StructuredText",
							config: {
								single: "heading1",
								label: "Title",
								placeholder: "This is where it all begins...",
							},
						},
						description: {
							type: "StructuredText",
							config: {
								single: "paragraph",
								label: "Description",
								placeholder: "A nice description of your product",
							},
						},
					},
				},
			],
		};

		const initialMocks = mockSlice({ model });

		const modelWithImage: SharedSlice = {
			...model,
			variations: [
				{
					...model.variations[0],
					primary: {
						...model.variations[0].primary,
						image: {
							config: { label: "image", constraint: {}, thumbnails: [] },
							type: "Image",
						},
					},
				},
			],
		};

		const result = mockSlice({
			model: modelWithImage,
			mocks: initialMocks,
			diff: SliceComparator.compare(model, modelWithImage),
		});

		expect(result).toMatchObject(initialMocks);
		// The image is random, so we check its properties instead.
		expect(result[0].primary).toHaveProperty(
			"image",
			expect.objectContaining({
				__TYPE__: "ImageContent",
				url: expect.any(String),
				origin: {
					id: "main",
					url: expect.any(String),
					width: expect.any(Number),
					height: expect.any(Number),
				},
				width: expect.any(Number),
				height: expect.any(Number),
				edit: { zoom: 1, crop: { x: 0, y: 0 }, background: "transparent" },
				thumbnails: {},
			}),
		);
		// TODO: check with the mock reader that this is valid
		// const decoded = SliceMock.decode(result);
		// expect(isRight(decoded)).toBeTruthy();
	});

	test("when I add a variation to a slice, the old mock content should be kept", () => {
		const sliceModel: SharedSlice = {
			id: "testing",
			type: "SharedSlice",
			name: "Testing",
			description: "Testing",
			variations: [
				{
					id: "default",
					name: "Default",
					docURL: "...",
					version: "sktwi1xtmkfgx8626",
					description: "Testing",
					primary: {
						title: {
							type: "StructuredText",
							config: {
								single: "heading1",
								label: "Title",
								placeholder: "This is where it all begins...",
							},
						},
						description: {
							type: "StructuredText",
							config: {
								single: "paragraph",
								label: "Description",
								placeholder: "A nice description of your feature",
							},
						},
					},
					items: {},
					imageUrl:
						"https://images.prismic.io/slice-machine/621a5ec4-0387-4bc5-9860-2dd46cbc07cd_default_ss.png?auto=compress,format",
				},
			],
		};

		const initialMocks = mockSlice({ model: sliceModel });
		const modelWithNewVariation: SharedSlice = {
			...sliceModel,
			variations: [
				...sliceModel.variations,
				{
					id: "foo",
					name: "Foo",
					docURL: "...",
					version: "sktwi1xtmkfgx8626",
					description: "Testing",
					primary: {
						title: {
							type: "StructuredText",
							config: {
								single: "heading1",
								label: "Title",
								placeholder: "This is where it all begins...",
							},
						},
						description: {
							type: "StructuredText",
							config: {
								single: "paragraph",
								label: "Description",
								placeholder: "A nice description of your feature",
							},
						},
					},
					items: {},
					imageUrl:
						"https://images.prismic.io/slice-machine/621a5ec4-0387-4bc5-9860-2dd46cbc07cd_default_ss.png?auto=compress,format",
				},
			],
		};

		const updatedMocks = mockSlice({
			model: modelWithNewVariation,
			mocks: initialMocks,
			diff: SliceComparator.compare(sliceModel, modelWithNewVariation),
		});

		expect(updatedMocks[0]).toEqual(initialMocks[0]);
		expect(updatedMocks[1]).toBeDefined();
	});
});
