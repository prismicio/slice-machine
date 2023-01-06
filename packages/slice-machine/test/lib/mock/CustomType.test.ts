import { describe, test, expect, vi } from "vitest";
import { WidgetTypes } from "@prismicio/types-internal/lib/customtypes/widgets";
import MockCustomType from "../../../lib/mock/CustomType";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import { SlicesTypes } from "@prismicio/types-internal/lib/customtypes/widgets/slices";

vi.mock("@prismicio/mocks/lib/generators/utils/slug", () => {
  return vi.fn().mockReturnValue("🥪");
});

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

vi.mock("uuid", () => ({ v4: vi.fn().mockReturnValue("id") }));

describe.skip("MockCustomType", () => {
  test("use default mock when custom one is not provided", () => {
    const wanted = {
      val1: {
        __TYPE__: "StructuredTextContent",
        value: [{ type: "heading1", content: { text: "🥪" } }],
      },
    };

    const model: CustomTypeSM = {
      id: "some_custom_type",
      label: "SomeCustomType",
      repeatable: false,
      status: false,
      tabs: [
        {
          key: "tab1",
          value: [
            {
              key: "val1",
              value: {
                type: WidgetTypes.RichText,
                config: {
                  label: "Title",
                  placeholder: "placeholder",
                  allowTargetBlank: true,
                  single: "heading1",
                },
              },
            },
          ],
        },
      ],
    };

    const mockConfig = {};

    const result = MockCustomType(model, mockConfig, {});

    expect(result).toStrictEqual(wanted);
  });
  test("use custom mock value if provided", () => {
    const wanted = {
      widget1: {
        __TYPE__: "StructuredTextContent",
        value: [
          {
            content: { text: "HARD CODED VALUE", spans: [] },
            type: "heading1",
          },
        ],
      },
    };

    const model: CustomTypeSM = {
      id: "some_custom_type",
      label: "SomeCustomType",
      repeatable: false,
      status: false,
      tabs: [
        {
          key: "Main",
          value: [
            {
              key: "widget1",
              value: {
                type: WidgetTypes.RichText,
                config: {
                  label: "Title",
                  placeholder: "placeholder",
                  allowTargetBlank: true,
                  single: "heading1",
                },
              },
            },
          ],
        },
      ],
    };

    const mockConfig = {
      widget1: {
        content: [
          {
            content: {
              text: "HARD CODED VALUE",
              spans: [],
            },
            type: "heading1",
          },
        ],
      },
      config: {
        patternType: "PARAGRAPH",
        blocks: 2,
      },
    };

    const result = MockCustomType(model, mockConfig, {});

    expect(result).toStrictEqual(wanted);
  });

  test("should create mocks when slices are passed", () => {
    const wanted = {
      group: {
        __TYPE__: "GroupContentType",
        value: [{ __TYPE__: "GroupItemContent", value: [] }],
      },
      slices: {
        __TYPE__: "SliceContentType",
        value: [
          {
            key: "my_slice$id",
            name: "my_slice",
            maybeLabel: undefined,
            widget: {
              __TYPE__: "SharedSliceContent",
              variation: "default",
              primary: {
                title: {
                  __TYPE__: "StructuredTextContent",
                  value: [{ type: "heading1", content: { text: "🥪" } }],
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
              items: [{ __TYPE__: "GroupItemContent", value: [] }],
            },
          },
        ],
      },
    };

    const model: CustomTypeSM = {
      id: "mycustomtype",
      label: "MyCustomType",
      repeatable: true,
      status: true,
      tabs: [
        {
          key: "Main",
          value: [
            {
              key: "group",
              value: {
                type: WidgetTypes.Group,
                config: { label: "GroupToto", fields: [] },
              },
            },
          ],
          sliceZone: {
            key: "slices",
            value: [{ key: "my_slice", value: { type: "SharedSlice" } }],
          },
        },
      ],
    };

    const mockConfig = {};

    const sharedSlices = {
      my_slice: {
        id: "my_slice",
        type: SlicesTypes.SharedSlice,
        name: "MySlice",
        description: "MySlice",
        variations: [
          {
            id: "default",
            name: "Default",
            docURL: "...",
            version: "sktwi1xtmkfgx8626",
            description: "MySlice",
            primary: {
              title: {
                type: WidgetTypes.RichText,
                config: {
                  single: "heading1",
                  label: "Title",
                  placeholder: "This is where it all begins...",
                },
              },
              description: {
                type: WidgetTypes.RichText,
                config: {
                  single: "paragraph",
                  label: "Description",
                  placeholder: "A nice description of your feature",
                },
              },
            },
            imageUrl:
              "https://images.prismic.io/slice-machine/621a5ec4-0387-4bc5-9860-2dd46cbc07cd_default_ss.png?auto=compress,format",
            items: {},
          },
        ],
      },
    };

    const result = MockCustomType(model, mockConfig, sharedSlices);

    expect(result).toStrictEqual(wanted);
  });
});
