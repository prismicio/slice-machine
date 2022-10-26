import "@testing-library/jest-dom";
import { WidgetTypes } from "@prismicio/types-internal/lib/customtypes/widgets";
import { SlicesTypes } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { SliceSM, Slices } from "@slicemachine/core/build/models";
import { isRight } from "fp-ts/lib/Either";
import MockSlice from "../../../lib/mock/Slice";
import allFieldSliceModel from "../../../tests/__mocks__/sliceModel";
import {
  GeoPointContent,
  StructuredTextContent,
} from "@prismicio/types-internal/lib/documents/widgets/nestable";
import { LinkContent } from "@prismicio/types-internal/lib/documents/widgets/nestable/Link";
import { SharedSliceContent } from "@slicemachine/core/build/models/Slice";

jest.mock("lorem-ipsum", () => {
  return {
    __edModule: true,
    LoremIpsum: jest.fn().mockImplementation(() => {
      return {
        generateParagraphs: jest.fn().mockReturnValue("Some text."),
      };
    }),
  };
});

jest.mock("@prismicio/mocks/lib/generators/utils/slug", () => {
  return jest.fn().mockReturnValue("Woo");
});

describe("MockSlice", () => {
  test("parse primary", () => {
    const text = {
      title: {
        __TYPE__: "StructuredTextContent",
        value: [{ type: "heading1", content: { text: "Woo" } }],
      },
    };

    const got = StructuredTextContent.decode(text.title.value);
    expect(isRight(got)).toBeTruthy();

    const link = {
      "link-2": {
        __TYPE__: "LinkContent",
        value: { url: "http://twitter.com", __TYPE__: "ExternalLink" },
      },
    };
    const linkR = LinkContent.decode(link["link-2"].value);
    expect(isRight(linkR)).toBeTruthy();

    const geo = {
      key: {
        // __TYPE__: GeoPointContentType,
        position: { lat: 48.8583736, lng: 2.2922926 },
      },
    };
    const geoR = GeoPointContent.decode(geo.key);

    expect(isRight(geoR)).toBeTruthy();
  });

  test("when creating a slice it should return the default mock", () => {
    const wanted = [
      {
        __TYPE__: "SharedSliceContent",
        variation: "default",
        primary: {
          title: {
            __TYPE__: "StructuredTextContent",
            value: [{ type: "heading1", content: { text: "Woo" } }],
          },
          description: {
            __TYPE__: "StructuredTextContent",
            value: [{ type: "paragraph", content: { text: "Some text." } }],
          },
        },
        items: [],
      },
    ];

    const model: SliceSM = {
      id: "some_slice",
      type: SlicesTypes.SharedSlice,
      name: "SomeSlice",
      description: "SomeSlice",
      variations: [
        {
          id: "default",
          name: "Default",
          docURL: "...",
          version: "sktwi1xtmkfgx8626",
          description: "SomeSlice",
          primary: [
            {
              key: "title",
              value: {
                type: WidgetTypes.RichText,
                config: {
                  single: "heading1",
                  label: "Title",
                  placeholder: "This is where it all begins...",
                },
              },
            },
            {
              key: "description",
              value: {
                type: WidgetTypes.RichText,
                config: {
                  single: "paragraph",
                  label: "Description",
                  placeholder: "A nice description of your product",
                },
              },
            },
          ],
        },
      ],
    };

    const mockConfig = {};

    const result = MockSlice(model, mockConfig);

    expect(result).toEqual(wanted);
    const decoded = SharedSliceContent.decode(result);
    expect(isRight(decoded)).toBeTruthy();
    // needs to be readable by core/mocks/models SliceMock
  });

  test("when updating a mock with config", () => {
    const wanted = [
      {
        __TYPE__: "SharedSliceContent",
        variation: "default",
        primary: {
          title: {
            __TYPE__: "StructuredTextContent",
            value: [{ type: "heading1", content: { text: "Woo" } }],
          },
          description: {
            __TYPE__: "StructuredTextContent",
            value: [{ type: "paragraph", content: { text: "Some text." } }],
          },
          image: {
            __TYPE__: "ImageContent",
            url: "https://images.unsplash.com/photo-1555169062-013468b47731?fit=crop&w=900&h=500",
            origin: {
              id: "main",
              url: "https://images.unsplash.com/photo-1555169062-013468b47731",
              width: 900,
              height: 500,
            },
            width: 900,
            height: 500,
            edit: { zoom: 1, crop: { x: 0, y: 0 }, background: "transparent" },
            thumbnails: {},
          },
        },
        items: [{ __TYPE__: "GroupItemContent", value: [] }],
      },
    ];

    const model: SliceSM = {
      id: "some_slice",
      type: SlicesTypes.SharedSlice,
      name: "SomeSlice",
      description: "SomeSlice",
      variations: [
        {
          id: "default",
          name: "Default",
          docURL: "...",
          version: "sktwi1xtmkfgx8626",
          description: "SomeSlice",
          primary: [
            {
              key: "title",
              value: {
                type: WidgetTypes.RichText,
                config: {
                  single: "heading1",
                  label: "Title",
                  placeholder: "This is where it all begins...",
                },
              },
            },
            {
              key: "description",
              value: {
                type: WidgetTypes.RichText,
                config: {
                  single: "paragraph",
                  label: "Description",
                  placeholder: "A nice description of your product",
                },
              },
            },
            {
              key: "image",
              value: {
                config: { label: "image", constraint: {}, thumbnails: [] },
                type: WidgetTypes.Image,
              },
            },
          ],
          items: [],
        },
      ],
    };

    const mockConfig = {
      default: {
        primary: {
          image: {
            content:
              "https://images.unsplash.com/photo-1555169062-013468b47731",
          },
        },
      },
    };

    const result = MockSlice(model, mockConfig);
    expect(result).toEqual(wanted);
    const decoded = SharedSliceContent.decode(result);
    expect(isRight(decoded)).toBeTruthy();
  });

  test("allFieldSliceModel", () => {
    const model = Slices.toSM({ ...allFieldSliceModel });
    const mock = MockSlice(model, {});
    // console.dir({ mock }, { depth: null });
    const result = SharedSliceContent.decode(mock);
    // console.dir(result, { depth: null });
    expect(isRight(result)).toBeTruthy();
  });
});
