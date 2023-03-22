import { describe, test, expect, vi } from "vitest";
import { WidgetTypes } from "@prismicio/types-internal/lib/customtypes/widgets";
import {
  SharedSlice,
  SlicesTypes,
} from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { Slices, SliceSM } from "@lib/models/common/Slice";
import { isRight } from "fp-ts/lib/Either";
import MockSlice from "../../../lib/mock/Slice";
import { GeoPointContent } from "@prismicio/types-internal/lib/documents/widgets/nestable";
import { LinkContent } from "@prismicio/types-internal/lib/documents/widgets/nestable/Link";
import { SharedSliceContent } from "@prismicio/types-internal/lib/content";
import {
  DiffOperation,
  SliceDiff,
} from "@prismicio/types-internal/lib/customtypes/diff";

vi.mock("lorem-ipsum", () => {
  return {
    __esModule: true,
    LoremIpsum: vi.fn().mockImplementation(() => {
      return {
        generateParagraphs: vi.fn().mockReturnValue("Some text."),
      };
    }),
  };
});

vi.mock("@prismicio/mocks/lib/generators/utils/slug", () => {
  return vi.fn().mockReturnValue("Woo");
});

describe.skip("MockSlice", () => {
  test("parse primary", () => {
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

    const result = MockSlice(Slices.fromSM(model));

    expect(result).toEqual(wanted);
    // TODO: check the codec we use for SharedSliceContent[]
    // const decoded = SliceMock.decode(result);
    // expect(isRight(decoded)).toBeTruthy();
    // needs to be readable by core/mocks/models SliceMock
  });

  test("when updating a mock with config", () => {
    // "image" is missing, see below.
    const partial = [
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

    const result = MockSlice(Slices.fromSM(model));
    // "result" contains more than "partial"
    expect(result).toMatchObject(partial);
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
      })
    );
    // TODO: check with the mock reader that this is valid
    // const decoded = SliceMock.decode(result);
    // expect(isRight(decoded)).toBeTruthy();
  });

  // change slice mock to the codec for SharedSliceContent[]
  // test.skip("allFieldSliceModel", () => {
  //   const model = Slices.toSM({ ...allFieldSliceModel });
  //   const mock = MockSlice(model, {});
  //
  //   const result = SliceMock.decode(mock);
  //   expect(isRight(result)).toBeTruthy();
  // });

  test("when i add a variation to a slice it should the old mock content should be kept", () => {
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
    const previousMocks: SharedSliceContent[] = [
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
                  text: "Test Heading",
                  // "spans": []
                },
                // "direction": "ltr"
              },
            ],
          },
          description: {
            __TYPE__: "StructuredTextContent",
            value: [
              {
                type: "paragraph",
                content: {
                  text: "Some text on the default slice.",
                },
              },
            ],
          },
        },
        items: [
          {
            __TYPE__: "GroupItemContent",
            value: [],
          },
        ],
      },
    ];
    const sliceDiff: SliceDiff = {
      op: DiffOperation.Updated,
      value: {
        variations: {
          foo: {
            op: DiffOperation.Added,
            value: {
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
          },
        },
      },
    };

    const wanted = [
      ...previousMocks,
      {
        __TYPE__: "SharedSliceContent",
        variation: "foo",
        primary: {
          title: {
            __TYPE__: "StructuredTextContent",
            value: [
              {
                type: "heading1",
                content: {
                  text: "Woo",
                },
                // direction: "ltr",
              },
            ],
          },
          description: {
            __TYPE__: "StructuredTextContent",
            value: [
              {
                type: "paragraph",
                content: {
                  text: "Some text.",
                },
              },
            ],
          },
        },
        items: [
          {
            __TYPE__: "GroupItemContent",
            value: [],
          },
        ],
      },
    ];

    const results = MockSlice(sliceModel, previousMocks, sliceDiff);

    // check the content is unchanged
    expect(results[0]).toEqual(previousMocks[0]);
    expect(results).toEqual(wanted);
  });
});
