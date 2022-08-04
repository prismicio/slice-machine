import "@testing-library/jest-dom";
import { WidgetTypes } from "@prismicio/types-internal/lib/customtypes/widgets";
import { SlicesTypes } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { SliceSM, SliceMock } from "@slicemachine/core/build/models";
import { isRight } from "fp-ts/lib/Either";
import MockSlice from "../../../lib/mock/Slice";

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

describe("MockSlice", () => {
  test("when creating a slice it should return the default mock", () => {
    const wanted = [
      {
        variation: "default",
        slice_type: "some_slice",
        items: [],
        primary: {
          title: [{ type: "heading1", text: "RANDOM_VALUE", spans: [] }],
          description: [{ type: "paragraph", text: "Some text.", spans: [] }],
        },
        version: "sktwi1xtmkfgx8626",
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

    // override the randomly generated value since we cannot mock it
    // @ts-expect-error `result` is typed as unknown[]
    result[0].primary.title[0].text = "RANDOM_VALUE";

    expect(result).toEqual(wanted);
    expect(isRight(SliceMock.decode(result))).toBeTruthy();
    // needs to be readable by core/mocks/models SliceMock
  });

  test("when updating a mock with config", () => {
    const wanted = [
      {
        variation: "default",
        slice_type: "some_slice",
        items: [{}],
        primary: {
          title: [{ type: "heading1", text: "RANDOM_VALUE", spans: [] }],
          description: [{ type: "paragraph", text: "Some text.", spans: [] }],
          image: {
            dimensions: { width: 900, height: 500 },
            alt: null,
            copyright: null,
            url: "https://images.unsplash.com/photo-1555169062-013468b47731",
          },
        },
        version: "sktwi1xtmkfgx8626",
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

    // override the randomly generated value since we cannot mock it
    // @ts-expect-error `result` is typed as unknown[]
    result[0].primary.title[0].text = "RANDOM_VALUE";

    expect(result).toEqual(wanted);
    expect(isRight(SliceMock.decode(result))).toBeTruthy();
  });
});
