import { describe, expect } from "vitest";
import { createCustomType } from "@src/features/customTypes/customTypesTable/createCustomType";

describe("[Custom types factory]", () => {
  describe("[createCustomType]", () => {
    it("should create a custom type with repeatable true", () => {
      expect(createCustomType("id", "lama", true, "custom"))
        .toMatchInlineSnapshot(`
        {
          "format": "custom",
          "id": "id",
          "label": "lama",
          "repeatable": true,
          "status": true,
          "tabs": [
            {
              "key": "Main",
              "value": [
                {
                  "key": "uid",
                  "value": {
                    "config": {
                      "label": "UID",
                    },
                    "type": "UID",
                  },
                },
              ],
            },
          ],
        }
      `);
    });

    it("should create a custom type with repeatable false", () => {
      const result = createCustomType("id", "lama", false, "custom");
      expect(result.id).toBe("id");
      expect(result.label).toBe("lama");
      expect(result.format).toBe("custom");
      expect(result.tabs).not.toHaveLength(0);
      expect(result).toMatchInlineSnapshot(`
        {
          "format": "custom",
          "id": "id",
          "label": "lama",
          "repeatable": false,
          "status": true,
          "tabs": [
            {
              "key": "Main",
              "value": [],
            },
          ],
        }
      `);
    });

    it("should create a page type with a slice zone", () => {
      const result = createCustomType("🥪", "label", true, "page");
      expect(result.format).toBe("page");
      expect(result.tabs).not.toHaveLength(0);
      const [main] = result.tabs;
      expect(main).toHaveProperty("sliceZone");

      expect(result).toMatchInlineSnapshot(`
        {
          "format": "page",
          "id": "🥪",
          "label": "label",
          "repeatable": true,
          "status": true,
          "tabs": [
            {
              "key": "Main",
              "sliceZone": {
                "key": "slices",
                "value": [],
              },
              "value": [
                {
                  "key": "uid",
                  "value": {
                    "config": {
                      "label": "UID",
                    },
                    "type": "UID",
                  },
                },
              ],
            },
            {
              "key": "SEO & Metadata",
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
                      "thumbnails": [],
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
