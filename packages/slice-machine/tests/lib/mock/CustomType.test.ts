import "@testing-library/jest-dom";
import { WidgetTypes } from "@prismicio/types-internal/lib/customtypes/widgets";
import MockCustomType from "../../../lib/mock/CustomType";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";

describe("MockCustomType", () => {
  test("use default mock when custom one is not provided", () => {
    const wanted = {
      alternate_languages: [],
      data: { val1: [{ spans: [], text: "RANDOM_VALUE", type: "heading1" }] },
      first_publication_date: "1970-01-01T00:00:01+0000",
      href: null,
      id: "mock-doc-id",
      lang: "en-us",
      last_publication_date: "1970-01-01T00:00:01+0000",
      linked_documents: [],
      slugs: [],
      tags: [],
      type: "some_custom_type",
      uid: undefined,
      url: null,
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

    // override the randomly generated value since we cannot mock it
    // @ts-expect-error `result` is typed as unknown[]
    result.data.val1[0].text = "RANDOM_VALUE";

    expect(result).toStrictEqual(wanted);
  });
  test("use custom mock value if provided", () => {
    const wanted = {
      alternate_languages: [],
      data: {
        widget1: [
          {
            spans: [],
            text: "HARD CODED VALUE",
            type: "heading1",
          },
        ],
      },
      first_publication_date: "1970-01-01T00:00:01+0000",
      href: null,
      id: "mock-doc-id",
      lang: "en-us",
      last_publication_date: "1970-01-01T00:00:01+0000",
      linked_documents: [],
      slugs: [],
      tags: [],
      type: "some_custom_type",
      uid: undefined,
      url: null,
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
