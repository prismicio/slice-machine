import { describe, expect } from "vitest";
import { createCustomType } from "@src/modules/availableCustomTypes/factory";
import { CustomTypeSM } from "@lib/models/common/CustomType";

describe("[Custom types factory]", () => {
  describe("[createCustomType]", () => {
    it("should create a custom type with repeatable true", () => {
      const expectedCustomType: CustomTypeSM = {
        id: "id",
        label: "lama",
        format: "custom",
        repeatable: true,
        status: true,
        tabs: [
          {
            key: "Main",
            value: [
              {
                key: "uid",
                value: {
                  type: "UID",
                  config: {
                    label: "UID",
                  },
                },
              },
            ],
          },
          {
            key: "Metadata",
            value: [
              {
                key: "meta_title",
                value: {
                  type: "Text",
                  config: {
                    label: "Meta Title",
                    placeholder:
                      "A title of the page used for social media and search engines",
                  },
                },
              },
              {
                key: "meta_description",
                value: {
                  type: "StructuredText",
                  config: {
                    label: "Meta Description",
                    placeholder: "A brief summary of the page",
                  },
                },
              },
              {
                key: "meta_image",
                value: {
                  type: "Image",
                  config: {
                    label: "Meta Image",
                    constraint: {
                      width: 2400,
                      height: 1260,
                    },
                  },
                },
              },
            ],
          },
        ],
      };
      expect(createCustomType("id", "lama", true)).toEqual(expectedCustomType);
    });
    it("should create a custom type with repeatable false", () => {
      const result = createCustomType("id", "lama", false);
      expect(result.id).toBe("id");
      expect(result.label).toBe("lama");
      expect(result.tabs).not.toHaveLength(0);
      expect(result).toMatchInlineSnapshot(`
        {
          "id": "id",
          "label": "lama",
          "repeatable": false,
          "status": true,
          "tabs": [
            {
              "key": "Main",
              "value": [],
            },
            {
              "key": "Metadata",
              "value": [
                {
                  "key": "meta_title",
                  "value": {
                    "config": {
                      "label": "Meta Title",
                      "placeholder": "A title of the page used for social media and search engines",
                    },
                    "type": "Text",
                  },
                },
                {
                  "key": "meta_description",
                  "value": {
                    "config": {
                      "label": "Meta Description",
                      "placeholder": "A brief summary of the page",
                    },
                    "type": "StructuredText",
                  },
                },
                {
                  "key": "meta_image",
                  "value": {
                    "config": {
                      "constraint": {
                        "height": 1260,
                        "width": 2400,
                      },
                      "label": "Meta Image",
                    },
                    "type": "Image",
                  },
                },
              ],
            },
          ],
        }
      `);
    });
  });
});
