import MockSlice from "../../../lib/mock/Slice";
import faker from "@faker-js/faker";

global.console = { ...global.console, error: jest.fn() };

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
    jest.spyOn(faker.company, "bs").mockReturnValueOnce("Foo.");

    const wanted = [
      {
        variation: "default",
        name: "Default",
        slice_type: "some_slice",
        items: [],
        primary: {
          title: [{ type: "heading1", text: "Foo.", spans: [] }],
          description: [{ type: "paragraph", text: "Some text.", spans: [] }],
        },
      },
    ];

    const model = {
      id: "some_slice",
      type: "SharedSlice",
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
                type: "StructuredText",
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
                type: "StructuredText",
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
  });

  test("when updating a mock with config", () => {
    jest.spyOn(faker.company, "bs").mockReturnValueOnce("Foo.");

    const wanted = [
      {
        variation: "default",
        name: "Default",
        slice_type: "some_slice",
        items: [],
        primary: {
          title: [{ type: "heading1", text: "Foo.", spans: [] }],
          description: [{ type: "paragraph", text: "Some text.", spans: [] }],
          image: {
            dimensions: { width: 900, height: 500 },
            alt: "Placeholder image",
            copyright: null,
            url: "https://images.unsplash.com/photo-1555169062-013468b47731?w=900&h=500&fit=crop",
          },
        },
      },
    ];

    const model = {
      id: "some_slice",
      type: "SharedSlice",
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
                type: "StructuredText",
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
                type: "StructuredText",
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
                type: "Image",
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
  });
});
