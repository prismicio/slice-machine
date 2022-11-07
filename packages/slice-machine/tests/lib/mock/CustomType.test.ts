import "@testing-library/jest-dom";
import { WidgetTypes } from "@prismicio/types-internal/lib/customtypes/widgets";
import MockCustomType from "../../../lib/mock/CustomType";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";

jest.mock("@prismicio/mocks/lib/generators/utils/slug", () => {
  return jest.fn().mockReturnValue("🥪");
});

describe("MockCustomType", () => {
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

    const result = MockCustomType(model, mockConfig);

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

    const result = MockCustomType(model, mockConfig);

    expect(result).toStrictEqual(wanted);
  });
});
